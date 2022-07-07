import { Dispatch, FormEvent, SetStateAction, useMemo, useState } from "react";

import {
    Button,
    Card,
    Form,
    onError,
    Text,
    uploadIpfsFileWithTransaction,
    uploadToIpfs,
    useUALAccount,
} from "_app";
import {
    convertPendingProfileToMember,
    MemberCardPreview,
    setInductionProfileTransaction,
} from "inductions";
import { Induction, NewMemberProfile } from "inductions/interfaces";

interface Props {
    induction: Induction;
    setDidSubmitProfile: Dispatch<SetStateAction<boolean>>;
    pendingProfile: {
        profileInfo?: NewMemberProfile;
        selectedPhoto?: File;
    };
    editProfile: () => void;
}

export const InductionProfilePreview = ({
    induction,
    setDidSubmitProfile,
    pendingProfile,
    editProfile,
}: Props) => {
    const [isLoading, setIsLoading] = useState(false);
    const [ualAccount] = useUALAccount();
    const { profileInfo, selectedPhoto } = pendingProfile;

    const submitInductionProfileTransaction = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (!profileInfo) throw new Error("Profile data is missing.");
            const img = selectedPhoto
                ? await uploadToIpfs(selectedPhoto)
                : profileInfo.img;
            const authorizerAccount = ualAccount.accountName;
            const transaction = setInductionProfileTransaction(
                authorizerAccount,
                induction.id,
                { ...profileInfo, img }
            );
            console.info(transaction);

            const signedTrx = await ualAccount.signTransaction(transaction, {
                broadcast: !selectedPhoto,
                expireSeconds: 1200,
            });
            console.info("inductprofil trx", signedTrx);
            if (selectedPhoto) {
                await uploadIpfsFileWithTransaction(
                    signedTrx,
                    img,
                    selectedPhoto
                );
            }
            setDidSubmitProfile(true);
        } catch (error) {
            onError(error as Error, "Unable to set the profile ck");
        }
        setIsLoading(false);
    };

    const memberCardData = useMemo(() => {
        let pendingProfile = profileInfo;
        if (selectedPhoto) {
            const img = URL.createObjectURL(selectedPhoto);
            pendingProfile = { ...profileInfo!, img };
        }
        return convertPendingProfileToMember(
            pendingProfile!,
            induction.invitee
        );
    }, [induction.invitee, profileInfo, selectedPhoto]);

    return (
        <>
            <MemberCardPreview cardTitle="" member={memberCardData} />
            <Card title="檢查你的資料">
                <form
                    onSubmit={submitInductionProfileTransaction}
                    className="grid grid-cols-6 gap-4"
                >
                    <div className="col-span-6">
                        <Text>
                        請逐條檢查你填寫的資料。這些資料將會用於生成你的第一個社區 NFT，並且能使其他成員更好地瞭解你。所以，請盡量保證其準確性。
                        </Text>
                    </div>
                    <div className="col-span-6 lg:col-span-3 p-3 border rounded">
                        <Form.Checkbox
                            id="image"
                            label="我的臉清晰可見，很容易確定這就是我。我沒有戴口罩，也沒有戴墨鏡，沒有對面部進行遮擋。"
                            disabled={isLoading}
                            required
                        />
                    </div>
                    <div className="col-span-6 lg:col-span-3 p-3 border rounded">
                        <Form.Checkbox
                            id="statement"
                            label="我確定我的資料陳述準確且完整。"
                            disabled={isLoading}
                            required
                        />
                    </div>
                    <div className="col-span-6 lg:col-span-3 p-3 border rounded">
                        <Form.Checkbox
                            id="links"
                            label="以上每一個社交媒體賬號鏈接我都已經點擊進去查看，並且確定鏈接都準確有效。"
                            disabled={isLoading}
                            required
                        />
                    </div>
                    <div className="col-span-6 lg:col-span-3 p-3 border rounded">
                        <Form.Checkbox
                            id="handles"
                            label="我提供的所有社交媒體鏈接對應的賬號都屬於我."
                            disabled={isLoading}
                            required
                        />
                    </div>
                    <div className="col-span-6 p-3 border rounded">
                        <Form.Checkbox
                            id="consent"
                            label="我理解且認可提交我的個人資料意味著我正在永久且不可撤回地把我的信息發佈在不可更改的公共區塊鏈上。"
                            disabled={isLoading}
                            required
                        />
                    </div>
                    <div className="flex col-span-6 pt-4 space-x-4 justify-center sm:justify-start">
                        <Button onClick={editProfile} type="neutral">
                            修改资料
                        </Button>
                        <Button
                            isSubmit
                            isLoading={isLoading}
                            disabled={isLoading}
                        >
                            {isLoading ? "提交中..." : "提交資料"}
                        </Button>
                    </div>
                </form>
            </Card>
        </>
    );
};

export default InductionProfilePreview;
