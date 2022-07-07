import { getInductionStatus } from "inductions/utils";
import { useState } from "react";
import { FaTrash } from "react-icons/fa";
import { useQuery } from "react-query";

import {
    ButtonType,
    Button,
    onError,
    useUALAccount,
    queryEndorsementsByInductionId,
} from "_app";
import { ROUTES } from "_app/routes";

import { Induction, InductionRole, InductionStatus } from "../../interfaces";
import { cancelInductionTransaction } from "../../transactions";

interface Props {
    induction: Induction;
    role?: InductionRole;
}

export const InductionStatusButton = ({ induction, role }: Props) => {
    const [ualAccount] = useUALAccount();
    const [isLoading, setLoading] = useState(false);
    const [isCanceled, setCanceled] = useState(false);

    const { data: endorsements } = useQuery(
        queryEndorsementsByInductionId(induction.id)
    );

    const status = getInductionStatus(induction, endorsements);

    const canCancel =
        role === InductionRole.Endorser ||
        role === InductionRole.Invitee ||
        role === InductionRole.Inviter;

    const canEndorse =
        ualAccount &&
        endorsements?.some(
            (endorsement) =>
                endorsement.endorser === ualAccount.accountName &&
                !endorsement.endorsed
        );

    const cancelInduction = async () => {
        try {
            const authorizerAccount = ualAccount.accountName;
            const transaction = cancelInductionTransaction(
                authorizerAccount,
                induction.id
            );
            console.info(transaction);

            setLoading(true);

            const signedTrx = await ualAccount.signTransaction(transaction, {
                broadcast: true,
            });
            console.info("inductcancel trx", signedTrx);

            setCanceled(true);
        } catch (error) {
            onError(error, "Unable to cancel induction");
        }

        setLoading(false);
    };

    if (isCanceled) {
        return <div className="w-full text-center text-red-500">Canceled</div>;
    } else if (status === InductionStatus.Expired) {
        return canCancel ? (
            <Button
                type="danger"
                size="sm"
                fullWidth
                isLoading={isLoading}
                onClick={cancelInduction}
            >
                <FaTrash className="mr-2" />
                Expired
            </Button>
        ) : (
            <div className="w-full text-center text-gray-400">Expired</div>
        );
    }

    let buttonType: ButtonType = "disabled";
    let buttonLabel = "";
    switch (status) {
        case InductionStatus.PendingProfile:
            if (role === InductionRole.Invitee) {
                buttonType = "inductionStatusCeremony";
                buttonLabel = "創建我的個人資料";
            } else {
                buttonType = "neutral";
                buttonLabel = "待完善資料";
            }
            break;
        case InductionStatus.PendingCeremonyVideo:
            if (
                role === InductionRole.Inviter ||
                role === InductionRole.Endorser
            ) {
                buttonType = "inductionStatusCeremony";
                buttonLabel = "完成見證";
            } else {
                buttonType = "neutral";
                buttonLabel = "見證會視頻";
            }
            break;
        case InductionStatus.PendingEndorsement:
            if (canEndorse) {
                buttonType = "inductionStatusAction";
                buttonLabel = "審核與確認";
            } else {
                buttonType = "neutral";
                buttonLabel = "待確認";
            }
            break;
        case InductionStatus.PendingDonation:
            if (role === InductionRole.Invitee) {
                buttonType = "inductionStatusAction";
                buttonLabel = "捐贈";
            } else {
                buttonType = "neutral";
                buttonLabel = "待捐贈";
            }
            break;
        default:
            return <>Error</>;
    }

    return (
        <div className="flex items-center justify-center w-full">
            <Button
                size="sm"
                fullWidth
                href={`${ROUTES.INDUCTION.href}/${induction.id}`}
                type={buttonType}
            >
                {buttonLabel}
            </Button>
            {canCancel && (
                <Button
                    type="dangerOutline"
                    size="sm"
                    className="ml-2"
                    onClick={cancelInduction}
                    dataTestId="cancel-induction"
                >
                    <FaTrash />
                </Button>
            )}
        </div>
    );
};
