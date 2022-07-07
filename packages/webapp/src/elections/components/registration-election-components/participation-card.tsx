import React, { useState } from "react";
import { useQueryClient } from "react-query";
import dayjs from "dayjs";

import {
    delay,
    ElectionParticipationStatus,
    MemberStatus,
    onError,
    queryMemberByAccountName,
    useCountdown,
    useCurrentElection,
    useCurrentMember,
    useElectionStatus,
    useUALAccount,
} from "_app";
import {
    Button,
    Container,
    Form,
    Heading,
    Loader,
    Modal,
    PieStatusIndicator,
    Text,
} from "_app/ui";
import {
    setEncryptionPublicKeyTransaction,
    useEncryptionPassword,
    NewPasswordForm,
    ReenterPasswordForm,
    EncryptionPassword,
} from "encryption";
import { CurrentElection, ElectionStatus } from "elections/interfaces";
import { Avatars, ElectionCommunityRoomButton } from "elections/components";

import AddToCalendarButton from "./add-to-calendar-button";
import MoreInformationLink from "./more-information-link";
import { extractElectionDates } from "../../utils";
import { setElectionParticipation } from "../../transactions";

interface Props {
    election?: CurrentElection;
}

export const ParticipationCard = ({ election }: Props) => {
    const [electionIsAboutToStart, setElectionIsAboutToStart] = useState(false);

    const [ualAccount, _, ualShowModal] = useUALAccount();
    const { data: currentMember } = useCurrentMember();

    const isActiveMember = currentMember?.status === MemberStatus.ActiveMember;
    const isMemberParticipating =
        currentMember?.election_participation_status ===
        ElectionParticipationStatus.InElection;

    const isProcessing = election?.electionState === ElectionStatus.InitVoters;
    useCurrentElection({
        refetchInterval: electionIsAboutToStart || isProcessing ? 5000 : false,
        refetchIntervalInBackground: true,
    });

    const [
        showConfirmParticipationModal,
        setShowConfirmParticipationModal,
    ] = useState(false);
    const [
        showCancelParticipationModal,
        setShowCancelParticipationModal,
    ] = useState(false);

    if (!election) {
        return null;
    }

    if (isProcessing) {
        return (
            <Container className="py-10">
                <Loader />
            </Container>
        );
    }

    let electionDates = null;
    try {
        electionDates = extractElectionDates(election);
    } catch (e) {
        return <Text>{(e as Error).message}</Text>;
    }

    const electionDate = electionDates.startDateTime.format("LL");
    const electionStartTime = electionDates.startDateTime.format("LT z");
    const electionParticipationLimitTime = electionDates.participationTimeLimit.format(
        "LLL z"
    );

    const isPastElectionParticipationTimeLimit = dayjs().isAfter(
        electionDates.participationTimeLimit
    );

    const isTimeForCommunityRoom = dayjs().isAfter(
        electionDates.startDateTime.subtract(1, "hour")
    );

    let statusLabel = "";
    let participationActionLabel = "";
    let participationCallLabel = "";
    let participationOpenModalFn = () => {};
    let statusButton = null;

    if (!ualAccount) {
        participationCallLabel = "登錄報名.";
        statusButton = (
            <Button onClick={ualShowModal}>登錄報名</Button>
        );
    } else if (currentMember?.status === MemberStatus.ActiveMember) {
        console.log("当前成员的选举状态===" + currentMember?.election_participation_status)
        console.log("本轮选举状态===" + ElectionParticipationStatus.InElection)
        //if (!isMemberParticipating) {
        if (currentMember?.election_participation_status === ElectionParticipationStatus.NotInElection) {
            participationOpenModalFn = () =>
                setShowConfirmParticipationModal(true);
            statusLabel = "狀態：你尚未報名.";
            participationActionLabel = "我要報名";
            participationCallLabel = `你需要在 ${electionParticipationLimitTime} 前點擊 "${participationActionLabel}" 進行報名，方可參與.`;
        } else {
            participationOpenModalFn = () =>
                setShowCancelParticipationModal(true);
            statusLabel = "你的狀態：已報名";
            participationActionLabel = "我不想參加選舉";
            //participationCallLabel = `If you cannot attend, you must choose "${participationActionLabel}" 在 ${electionParticipationLimitTime}.`;
            participationCallLabel = `如果你不能按時出席，需要在 ${electionParticipationLimitTime} 前點擊"${participationActionLabel}"取消報名.`;
        }
        statusButton = (
            <Button onClick={participationOpenModalFn}>
                {participationActionLabel}
            </Button>
        );
    } else {
        participationCallLabel = "加入中文Eden!";
        statusButton = (
            <Button href="/induction">加入中文Eden</Button>
        );
    }

    return (
        <Container className="space-y-2.5">
            <div className="flex justify-between">
                <Heading size={2} className="inline-block">
                下一次選舉
                </Heading>
                <Heading size={2} className="inline-block">
                    {electionDates.startDateTime.format("MMM D")}
                </Heading>
            </div>
            <Avatars />
            <Heading size={3}>{statusLabel}</Heading>
            {isPastElectionParticipationTimeLimit ? (
                <>
                    <ParticipationCardCountdown
                        electionDates={electionDates}
                        onEnd={() => setElectionIsAboutToStart(true)}
                        electionIsAboutToStart={electionIsAboutToStart}
                    />
                    <Text>
                        報名通道已關閉。選舉即將于 {electionDate} {" "} {electionStartTime} 舉行。
                        {isActiveMember &&
                            isTimeForCommunityRoom &&
                            " 請點擊以下鏈接進入社區視頻會議室，以瞭解最新信息。"}
                    </Text>
                </>
            ) : (
                <Text>
                    下一屆選舉將於 {electionDate} {" "}
                     {electionStartTime}.{" "} 舉行，
                    <span className="font-semibold">
                        {participationCallLabel}
                    </span>
                </Text>
            )}

            <div className="flex flex-col sm:flex-row items-start sm:justify-between space-y-2 sm:space-y-0">
                {!isPastElectionParticipationTimeLimit && statusButton}
                {isActiveMember && isTimeForCommunityRoom && (
                    <ElectionCommunityRoomButton />
                )}
                {isMemberParticipating && !isTimeForCommunityRoom && (
                    <AddToCalendarButton election={election} />
                )}
            </div>
            <ParticipationCounter />
            <MoreInformationLink />
            <ConfirmParticipationModal
                isOpen={showConfirmParticipationModal}
                close={() => setShowConfirmParticipationModal(false)}
                deadline={electionParticipationLimitTime}
            />
            <CancelParticipationModal
                isOpen={showCancelParticipationModal}
                close={() => setShowCancelParticipationModal(false)}
            />
        </Container>
    );
};

const ParticipationCounter = () => {
    const { data: statusQueryResult } = useElectionStatus();
    return statusQueryResult ? (
        <div>
            <Text>
                當前報名人數:{" "}
                <strong>
                    {statusQueryResult.status.numElectionParticipants}
                </strong>
            </Text>
        </div>
    ) : null;
};

interface CountdownProps {
    electionDates: any;
    onEnd: () => void;
    electionIsAboutToStart: boolean;
}

const ParticipationCardCountdown = ({
    electionDates,
    onEnd,
    electionIsAboutToStart,
}: CountdownProps) => {
    const countdown = useCountdown({
        startTime: electionDates.startDateTime.subtract(1, "day").toDate(),
        endTime: electionDates.startDateTime.toDate(),
        onEnd,
    });

    return (
        <div className="flex items-center space-x-2">
            <PieStatusIndicator
                percent={countdown.percentDecimal * 100}
                size={24}
            />
            {electionIsAboutToStart ? (
                <Text className="font-semibold">
                    選舉即將開始
                </Text>
            ) : (
                <Text>
                    <span className="font-semibold">
                        選舉倒計時：
                    </span>{" "}
                    {countdown.hmmss}
                </Text>
            )}
        </div>
    );
};

interface ModalProps {
    isOpen: boolean;
    close: () => void;
    deadline?: string;
}

enum ParticipationStep {
    ConfirmParticipation,
    ConfirmParticipationSuccess,
    ConfirmPassword,
}

interface SetEncryptionPasswordAction {
    privateKey: string;
    publicKey: string;
    trx: any;
}

// TODO: Refactor to use password modals from new `usePasswordModal()` hook.
// See `meetingLink.tsx` for example implementation.
const ConfirmParticipationModal = ({ isOpen, close, deadline }: ModalProps) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [ualAccount] = useUALAccount();
    const queryClient = useQueryClient();
    const [step, setStep] = useState(ParticipationStep.ConfirmParticipation);
    const {
        encryptionPassword,
        updateEncryptionPassword,
    } = useEncryptionPassword();

    const onSubmit = async (
        setEncryptionPasswordAction?: SetEncryptionPasswordAction
    ) => {
        setIsLoading(true);

        try {
            const authorizerAccount = ualAccount.accountName;
            const transaction = setElectionParticipation(
                authorizerAccount,
                true
            );
            console.info("signing trx", transaction);

            if (setEncryptionPasswordAction) {
                transaction.actions = [
                    ...setEncryptionPasswordAction.trx.actions,
                    ...transaction.actions,
                ];
            }

            const signedTrx = await ualAccount.signTransaction(transaction, {
                broadcast: true,
            });
            console.info("electopt trx", signedTrx);

            await delay(3000); // allow time for chain tables to update

            // invalidate current member query to update participating status
            queryClient.invalidateQueries(
                queryMemberByAccountName(ualAccount.accountName).queryKey
            );

            if (setEncryptionPasswordAction) {
                updateEncryptionPassword(
                    setEncryptionPasswordAction.publicKey,
                    setEncryptionPasswordAction.privateKey
                );
            }

            setStep(ParticipationStep.ConfirmParticipationSuccess);
        } catch (error) {
            console.error(error);
            onError(error as Error);
        }
        setIsLoading(false);
    };

    const submitParticipationConfirmation = () => {
        if (!encryptionPassword.privateKey) {
            setStep(ParticipationStep.ConfirmPassword);
        } else {
            onSubmit();
        }
    };

    const submitPasswordConfirmation = async (
        setEncryptionPasswordTrx?: any
    ) => {
        await onSubmit(setEncryptionPasswordTrx);
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={close}
            onAfterClose={() => setStep(ParticipationStep.ConfirmParticipation)}
            contentLabel="Election Participation Modal - Confirming Participation"
            preventScroll
            shouldCloseOnOverlayClick={false}
            shouldCloseOnEsc={false}
        >
            {step === ParticipationStep.ConfirmParticipation && (
                <ConfirmParticipationStep
                    onSubmit={submitParticipationConfirmation}
                    isLoading={isLoading}
                    onCancel={close}
                    deadline={deadline}
                />
            )}
            {step === ParticipationStep.ConfirmParticipationSuccess && (
                <ConfirmParticipationStepSuccess close={close} />
            )}
            {step === ParticipationStep.ConfirmPassword && (
                <ConfirmPasswordStep
                    onSubmit={submitPasswordConfirmation}
                    isLoading={isLoading}
                    onCancel={close}
                    encryptionPassword={encryptionPassword}
                />
            )}
        </Modal>
    );
};

interface ConfirmParticipationStepProps {
    onSubmit: () => void;
    isLoading?: boolean;
    onCancel: () => void;
    deadline?: string;
}

const ConfirmParticipationStep = ({
    onSubmit,
    isLoading,
    onCancel,
    deadline,
}: ConfirmParticipationStepProps) => {
    const doSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit();
    };

    return (
        <form onSubmit={doSubmit}>
            <div className="space-y-4">
                <Heading>我要報名</Heading>
                <Text>
                你正在報名參加下一屆社區選舉。已報名但沒有在選舉時出現，可能會影響你在社區中的信譽。如因特殊原因不能參加選舉，
                請在  {deadline} 前更新你的報名狀態。
                </Text>
                <div className="p-3 border rounded">
                    <Form.Checkbox
                        id="confirm-checkbox"
                        label="我願意報名參加選舉并保證會及時更新我的狀態。"
                        disabled={isLoading}
                        required
                    />
                </div>
                <div className="flex space-x-3">
                    <Button
                        type="neutral"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        取消
                    </Button>
                    <Button isSubmit isLoading={isLoading} disabled={isLoading}>
                        {isLoading ? "Submitting..." : "確定"}
                    </Button>
                </div>
            </div>
        </form>
    );
};

const ConfirmParticipationStepSuccess = ({ close }: { close: () => void }) => {
    return (
        <div className="space-y-4">
            <Heading>成功!</Heading>
            <Text>
                你承諾參與即將舉行的選舉
            </Text>
            <div className="flex space-x-3">
                <Button onClick={close}>OK</Button>
            </div>
        </div>
    );
};

interface ConfirmPasswordStepProps {
    onSubmit: (
        setEncryptionPasswordAction?: SetEncryptionPasswordAction
    ) => void;
    isLoading?: boolean;
    onCancel: () => void;
    encryptionPassword: EncryptionPassword;
}

const ConfirmPasswordStep = ({
    onSubmit,
    isLoading,
    onCancel,
    encryptionPassword,
}: ConfirmPasswordStepProps) => {
    const [ualAccount] = useUALAccount();
    const [forgotPasswordMode, setForgotPasswordMode] = useState(false);

    // Instantiate with encryptionPassword and keep that value so that modal doesn't flip
    // between <NewPasswordForm /> and <ReenterPasswordForm /> modes while open and saving.
    const [password] = useState(encryptionPassword);

    const doSubmitWithNewKeyTrx = async (
        publicKey: string,
        privateKey: string
    ): Promise<void> => {
        const authorizerAccount = ualAccount.accountName;
        const trx = setEncryptionPublicKeyTransaction(
            authorizerAccount,
            publicKey
        );
        await onSubmit({ trx, publicKey, privateKey });
    };

    const doSubmitWithoutTrx = async (
        publicKey: string,
        privateKey: string
    ) => {
        await onSubmit({ trx: { actions: [] }, publicKey, privateKey });
    };

    if (forgotPasswordMode || !password.publicKey) {
        // when key is not present or user clicked in forgot password
        return (
            <NewPasswordForm
                isLoading={isLoading}
                onSubmit={doSubmitWithNewKeyTrx}
                onCancel={() => {
                    setForgotPasswordMode(false);
                    onCancel();
                }}
                forgotPassword={forgotPasswordMode}
            />
        );
    } else {
        // public key present, user needs to re-enter password
        return (
            <ReenterPasswordForm
                expectedPublicKey={encryptionPassword.publicKey!}
                isLoading={isLoading}
                onSubmit={doSubmitWithoutTrx}
                onCancel={onCancel}
                onForgotPassword={() => setForgotPasswordMode(true)}
            />
        );
    }
};

const CancelParticipationModal = ({ isOpen, close }: ModalProps) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [ualAccount] = useUALAccount();
    const queryClient = useQueryClient();

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsLoading(true);

        try {
            const authorizerAccount = ualAccount.accountName;
            const transaction = setElectionParticipation(
                authorizerAccount,
                false
            );
            console.info("signing trx", transaction);

            const signedTrx = await ualAccount.signTransaction(transaction, {
                broadcast: true,
            });
            console.info("electopt trx", signedTrx);

            // invalidate current member query to update participating status
            await delay(3000);
            queryClient.invalidateQueries(
                queryMemberByAccountName(ualAccount.accountName).queryKey
            );

            close();
        } catch (error) {
            console.error(error);
            onError(error as Error);
        }

        setIsLoading(false);
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={close}
            contentLabel="Election Participation Modal - Canceling Participation"
            preventScroll
            shouldCloseOnOverlayClick={false}
            shouldCloseOnEsc={false}
        >
            <div className="space-y-4">
                <Heading>我不想參與競選</Heading>
                <Text>
                    感謝你提前告知。請在下方進行確認。如果您的計劃有變，仍可以在選舉前24小時以上隨時更新您的參與狀態。
                </Text>
                <div className="flex space-x-3">
                    <Button type="neutral" onClick={close} disabled={isLoading}>
                        取消
                    </Button>
                    <Button
                        onClick={onSubmit}
                        isLoading={isLoading}
                        disabled={isLoading}
                    >
                        {isLoading ? "Submitting..." : "確定"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
