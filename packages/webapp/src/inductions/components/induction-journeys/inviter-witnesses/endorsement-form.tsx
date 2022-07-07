import { Dispatch, FormEvent, SetStateAction, useState } from "react";
import { useQueryClient } from "react-query";
import { RiVideoUploadFill } from "react-icons/ri";
import { FaPlayCircle } from "react-icons/fa";

import {
    Button,
    Form,
    Heading,
    ipfsUrl,
    onError,
    OpensInNewTabIcon,
    queryInductionWithEndorsements,
    Text,
    useUALAccount,
} from "_app";
import { submitEndorsementTransaction } from "inductions";
import { Induction } from "inductions/interfaces";

interface Props {
    induction: Induction;
    setIsRevisitingVideo: Dispatch<SetStateAction<boolean>>;
}

export const InductionEndorsementForm = ({
    induction,
    setIsRevisitingVideo,
}: Props) => {
    const [ualAccount] = useUALAccount();
    const queryClient = useQueryClient();
    const [isLoading, setLoading] = useState(false);

    const submitEndorsement = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const authorizerAccount = ualAccount.accountName;
            const transaction = await submitEndorsementTransaction(
                authorizerAccount,
                induction
            );
            console.info(transaction);

            setLoading(true);

            const signedTrx = await ualAccount.signTransaction(transaction, {
                broadcast: true,
            });
            console.info("inductendors trx", signedTrx);

            // tolerance time to make sure blockchain processed the transactions
            await new Promise((resolve) => setTimeout(resolve, 6000));

            // refetch induction/endorsements to update endorsements list or go to pending donate screen
            queryClient.invalidateQueries(
                queryInductionWithEndorsements(induction.id).queryKey
            );
        } catch (error) {
            onError(error as Error, "Unable to submit endorsement");
            setLoading(false);
        }
    };

    return (
        <form onSubmit={submitEndorsement} className="mt-4 space-y-4">
            <section id="profile-review" className="space-y-2">
                <div className="mt-4 space-y-3">
                    <Heading size={2} className="mb-2">
                        資料審核
                    </Heading>
                    <Text>
                        請逐條仔細檢查該潛在社區成員的個人資料。如有需要更正的地方，請聯繫被邀請人做出修正。
                    </Text>
                </div>
                <div className="p-3 border rounded">
                    <Form.Checkbox
                        id="photo"
                        label="以下資料照片中的人和出現在見證會視頻上的是同一個人。她/他的臉在照片中很清晰很容易辨認（沒有戴口罩、墨鏡等等）。"
                        disabled={isLoading}
                        required
                    />
                </div>
                <div className="p-3 border rounded">
                    <Form.Checkbox
                        id="links"
                        label="我訪問了下面的每一個社交媒體賬號鏈接，這些鏈接都可以訪問，並且可以認定這些賬號確實歸屬於被邀請人。"
                        disabled={isLoading}
                        required
                    />
                </div>
            </section>
            <section id="video-review" className="space-y-2">
                <Heading size={2} className="mb-2">
                    視頻審核
                </Heading>
                <div className="flex flex-col items-center p-3 border rounded space-y-2">
                    <Form.Checkbox
                        id="video"
                        label="確保上傳的見證視頻無誤，並且確保所有參與者都清晰且容易辨認。"
                        disabled={isLoading}
                        required
                    />
                    <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row">
                        <Button
                            type="link"
                            href={ipfsUrl(induction.video)}
                            target="_blank"
                        >
                            <FaPlayCircle className="mr-2" />
                            視頻審核
                            <OpensInNewTabIcon className="mb-1.5" />
                        </Button>
                        <Button
                            type="link"
                            onClick={() => setIsRevisitingVideo(true)}
                        >
                            <RiVideoUploadFill className="mr-2" />
                            替換視頻
                        </Button>
                    </div>
                </div>
            </section>
            <section id="make-endorsement" className="space-y-2">
                <Heading size={2} className="">
                    確認
                </Heading>
                <div className="flex flex-col space-y-2 items-center md:flex-row md:space-y-0 lg:flex-col lg:space-y-2 xl:flex-row xl:space-y-0 p-3 border rounded space-x-2">
                    <Form.Checkbox
                        id="reviewed"
                        label="本人特此確認同意該人員加入 Eden 社區。"
                        disabled={isLoading}
                        required
                    />
                    <Button disabled={isLoading} isLoading={isLoading} isSubmit>
                        {isLoading ? "提交中..." : "確認"}
                    </Button>
                </div>
            </section>
        </form>
    );
};
