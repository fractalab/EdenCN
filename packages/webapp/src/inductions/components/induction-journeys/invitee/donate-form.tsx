import { useState } from "react";
import { useRouter } from "next/router";
import { useQueryClient } from "react-query";

import { minimumDonationAmount } from "config";
import {
    Button,
    Text,
    Link,
    Form,
    assetToLocaleString,
    useUALAccount,
    onError,
    queryMemberByAccountName,
} from "_app";
import { ROUTES } from "_app/routes";

import { donateAndCompleteInductionTransaction } from "inductions";
import { Induction } from "inductions/interfaces";

interface Props {
    induction: Induction;
    isCommunityActive?: boolean;
    setIsRevisitingProfile: (isRevisiting: boolean) => void;
}

export const InductionDonateForm = ({
    induction,
    isCommunityActive,
    setIsRevisitingProfile,
}: Props) => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [ualAccount] = useUALAccount();
    const [isProfileReviewed, setReviewedProfile] = useState(false);
    const [isLoading, setLoading] = useState(false);

    const submitDonation = async () => {
        try {
            const authorizerAccount = ualAccount.accountName;
            const transaction = donateAndCompleteInductionTransaction(
                authorizerAccount,
                induction
            );
            console.info(transaction);

            setLoading(true);
            const signedTrx = await ualAccount.signTransaction(transaction, {
                broadcast: true,
            });
            console.info("donation trx", signedTrx);

            // tolerance time to make sure blockchain processed the transactions
            await new Promise((resolve) => setTimeout(resolve, 6000));

            // invalidate ["member", accountName] query so it will refetch with their full name
            queryClient.invalidateQueries(
                queryMemberByAccountName(authorizerAccount).queryKey
            );

            // router goes to the newly created member page
            router.push(`${ROUTES.MEMBERS.href}/${induction.invitee}`);
            return;
        } catch (error) {
            onError(
                error,
                "無法捐贈並完成認證流程"
            );
        }

        setLoading(false);
    };

    return (
        <div className="space-y-3">
            <Text>
                最後確認你的個人資料是否完整且準確。如果有需要修改的，{" "}
                <Link onClick={() => setIsRevisitingProfile(true)}>
                    點擊這裡
                </Link>
                .
                {isCommunityActive &&
                    " 請記住，修改你的個人資料將需要所有見證人從新確認。"}
            </Text>
            <Text>
                如確認無誤，可以發起捐贈。
                {isCommunityActive &&
                    " 一旦完成，你的成員身份將被激活，同時NFT將被鑄造並分發。"}
            </Text>
            <div className="p-3 border rounded-md">
                <Form.Checkbox
                    id="reviewed"
                    label="我已經仔細核對過我的照片、鏈接、和個人信息，並對其準確性負責。我明白，在捐款後，我的NFT將被鑄造，並且我的個人資料以及此NFT系列將不能再修改。"
                    value={Number(isProfileReviewed)}
                    onChange={() => setReviewedProfile(!isProfileReviewed)}
                />
            </div>
            <div className="pt-1">
                <Button
                    disabled={isLoading || !isProfileReviewed}
                    onClick={submitDonation}
                    isLoading={isLoading}
                >
                    {isLoading
                        ? "捐款……"
                        : `捐款 ${assetToLocaleString(
                              minimumDonationAmount
                          )}`}
                </Button>
            </div>
        </div>
    );
};
