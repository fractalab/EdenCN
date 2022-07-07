import React, { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { FiUpload, FiVideo } from "react-icons/fi";

import { Button, Form, handleFileChange, Text } from "_app";
import { edenContractAccount, validUploadActions } from "config";
import { ipfsUrl } from "_app/utils/config-helpers";

export type VideoSubmissionPhase = "uploading" | "signing" | "finishing";
interface Props {
    uid?: number;
    video: string;
    onSubmit?: (video: File) => Promise<void>;
    submissionPhase?: VideoSubmissionPhase;
    submitButtonText?: string;
    submitButtonIcon?: JSX.Element;
    title?: string;
    subtitle?: string;
    action: string;
    uploadCompleteMessage?: string;
    uploadErrorMessage?: string;
}

export const VideoSubmissionFormAndPreview = ({
    uid = 0,
    video,
    onSubmit,
    action,
    submissionPhase,
    submitButtonText,
    submitButtonIcon = <FiUpload />,
    title = "",
    subtitle = "",
    uploadCompleteMessage = "",
    uploadErrorMessage = "",
}: Props) => {
    const [isLoading, setIsLoading] = useState(false);
    const [uploadedVideo, setUploadedVideo] = useState<File | undefined>(
        undefined
    );

    const [resettingVideo, setResetVideo] = useState(false);

    useEffect(() => {
        setResetVideo(true);
    }, [uploadedVideo]);

    useEffect(() => {
        setResetVideo(false);
    }, [resettingVideo]);

    const submitTransaction = async (e: FormEvent) => {
        e.preventDefault();
        if (!onSubmit || !uploadedVideo) return;
        setIsLoading(true);
        await onSubmit(uploadedVideo);
        setIsLoading(false);
    };

    const videoUrl = useMemo(() => {
        if (uploadedVideo) {
            return URL.createObjectURL(uploadedVideo);
        } else {
            return ipfsUrl(video);
        }
    }, [uploadedVideo, video]);

    const getSubmissionText = () => {
        switch (submissionPhase) {
            case "uploading":
                return "Uploading video...";
            case "signing":
                return "Waiting for you to sign...";
            case "finishing":
                return "Finishing up...";
            default:
                return submitButtonText;
        }
    };

    return (
        <form onSubmit={submitTransaction} className="space-y-3">
            <Form.LabeledSet
                label={title}
                htmlFor={"videoFile" + uid}
                description={subtitle}
            >
                {(video || uploadedVideo) && <VideoClip url={videoUrl} />}
            </Form.LabeledSet>
            {uploadErrorMessage && (
                <div className="text-center">
                    <Text size="lg" type="danger">
                        {uploadErrorMessage}
                    </Text>
                </div>
            )}
            {uploadCompleteMessage ? (
                <div className="text-center">
                    <Text size="lg" type="success">
                        {uploadCompleteMessage}
                    </Text>
                </div>
            ) : (
                <div className="flex justify-evenly items-center">
                    <div>
                        <FiVideo className="text-blue-500 mr-2 inline-block mb-1" />
                        <Form.FileInput
                            id={"videoFile" + uid}
                            accept="video/*"
                            label="選擇視頻"
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                            ) =>
                                handleFileChange(
                                    e,
                                    "video",
                                    validUploadActions[edenContractAccount][
                                        action
                                    ].maxSize,
                                    setUploadedVideo
                                )
                            }
                        />
                    </div>

                    {onSubmit && (
                        <div>
                            <Button
                                isSubmit
                                disabled={isLoading || !uploadedVideo}
                                isLoading={isLoading}
                                type="secondary"
                            >
                                {submitButtonIcon}
                                {getSubmissionText()}
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </form>
    );
};

const VideoClip = ({ url }: { url: string }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const previousUrl = useRef(url);

    useEffect(() => {
        if (previousUrl.current === url) {
            return;
        }

        if (videoRef.current) {
            videoRef.current.load();
        }

        previousUrl.current = url;
    }, [url]);

    return (
        <video key={url} ref={videoRef} controls>
            <source src={url} />
        </video>
    );
};
