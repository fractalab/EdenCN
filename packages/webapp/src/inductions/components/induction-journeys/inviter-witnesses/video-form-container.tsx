import { Dispatch, SetStateAction, useState } from "react";
import { useQueryClient } from "react-query";

import {
    Heading,
    onError,
    queryInductionWithEndorsements,
    Text,
    uploadIpfsFileWithTransaction,
    uploadToIpfs,
    useUALAccount,
} from "_app";
import { InductionNames } from "inductions";

import { Induction } from "../../../interfaces";
import { getInductionRemainingTimeDays } from "../../../utils";
import { setInductionVideoTransaction } from "../../../transactions";
import { VideoSubmissionPhase, VideoSubmissionFormAndPreview } from "_app/ui";

interface Props {
    induction: Induction;
    isRevisitingVideo: boolean;
    setSubmittedVideo: Dispatch<SetStateAction<boolean>>;
}

export const InductionVideoFormContainer = ({
    induction,
    isRevisitingVideo,
    setSubmittedVideo,
}: Props) => {
    const [ualAccount] = useUALAccount();
    const queryClient = useQueryClient();
    const [videoSubmissionPhase, setVideoSubmissionPhase] = useState<
        VideoSubmissionPhase | undefined
    >(undefined);

    const submitInductionVideo = async (videoFile: File) => {
        try {
            setVideoSubmissionPhase("uploading");
            const videoHash = await uploadToIpfs(videoFile);

            const authorizerAccount = ualAccount.accountName;
            const transaction = setInductionVideoTransaction(
                authorizerAccount,
                induction.id,
                videoHash
            );
            console.info(transaction);
            setVideoSubmissionPhase("signing");
            const signedTrx = await ualAccount.signTransaction(transaction, {
                broadcast: false,
                expireSeconds: 1200,
            });
            console.info("inductvideo trx", signedTrx);

            setVideoSubmissionPhase("finishing");
            await uploadIpfsFileWithTransaction(
                signedTrx,
                videoHash,
                videoFile
            );

            queryClient.invalidateQueries(
                queryInductionWithEndorsements(induction.id).queryKey
            );

            setSubmittedVideo(true);
        } catch (error) {
            onError(error as Error, "Unable to set the induction video");
            setVideoSubmissionPhase(undefined);
        }
    };

    return (
        <>
            <Heading size={1} className="mb-2">
                {isRevisitingVideo
                    ? "查閱視頻"
                    : "見證會視頻"}
            </Heading>
            <Text className="mb-8">
                注意，此邀請將在{" "}
                {getInductionRemainingTimeDays(induction)}日後過期。
            </Text>
            <div className="space-y-3 mb-8">
                <Text className="leading-normal">
                接下來該舉行見證會了！邀請人、見證人和潛在 Eden 成員需要錄製一個規範化的見證新成員加入的會議視頻。
                </Text>
                <InductionNames inductionId={induction.id} />
            </div>
            <VideoSubmissionFormAndPreview
                video={induction.video}
                onSubmit={submitInductionVideo}
                submissionPhase={videoSubmissionPhase}
                action="inductvideo"
                submitButtonText="上傳會議視頻"
                title="見證視頻"
                subtitle="作為見證人，請在此上傳見證視頻。"
            />
        </>
    );
};
