import { useState } from "react";

import { Text, Link, onError, Heading, Button } from "_app";
import { ROUTES } from "_app/routes";

import {
    InductionInviteForm,
    InductionStepInviter,
    InductionStepsContainer,
} from "inductions";

import { initializeInductionTransaction } from "../../../transactions";

interface Props {
    ualAccount: any;
}

export const InductionInviteFormContainer = ({ ualAccount }: Props) => {
    const [initializedInductionId, setInitializedInductionId] = useState("");

    const submitTransaction = async (newInduction: any) => {
        try {
            const authorizerAccount = ualAccount.accountName;
            const {
                id,
                transaction,
            } = initializeInductionTransaction(
                authorizerAccount,
                newInduction.invitee,
                [newInduction.witness1, newInduction.witness2]
            );
            console.info(transaction);
            const signedTrx = await ualAccount.signTransaction(transaction, {
                broadcast: true,
            });
            console.info("inductinit trx", signedTrx);
            setInitializedInductionId(id);
        } catch (error) {
            onError(error, "Unable to initialize the induction process");
        }
    };

    return (
        <InductionStepsContainer
            step={
                initializedInductionId
                    ? InductionStepInviter.PendingProfile
                    : InductionStepInviter.CreateInvite
            }
        >
            {initializedInductionId ? (
                <InviteConfirmation inductionId={initializedInductionId} />
            ) : (
                <>
                    <Heading size={1} className="mb-8">
                        邀請
                    </Heading>
                    <InductionInviteForm onSubmit={submitTransaction} />
                </>
            )}
        </InductionStepsContainer>
    );
};

const InviteConfirmation = ({ inductionId }: { inductionId: string }) => (
    <>
        <Heading size={1} className="mb-5">
            成功了！
        </Heading>
        <div className="space-y-3 mb-8">
            <Text className="leading-normal">
                現在輪到你的被邀請人創建他們的Eden檔案了。
            </Text>
            <Text className="leading-normal">
                你的被邀請人和見證人只要用他們的區塊鏈賬戶登錄，就可以在成員面板看到這個進行中的邀請。或者你也可以與他們分享這個鏈接:
            </Text>
            <Text className="leading-normal break-all">
                <Link href={`${ROUTES.INDUCTION.href}/${inductionId}`}>
                    {window.location.hostname}
                    {ROUTES.INDUCTION.href}/{inductionId}
                </Link>
            </Text>
            <Text className="leading-normal">
                這個見證過程必須在{" "}<span className="underline font-medium">7天</span>內完成。
                如果這個邀請過期了，你可以發出一個新的邀請。
            </Text>
        </div>
        <Button href={ROUTES.INDUCTION.href} size="lg">
            查看你的所有邀請
        </Button>
    </>
);
