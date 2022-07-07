import { SideNavLayout, CallToAction, useUALAccount } from "_app";
import { InductionsContainer, PendingInvitationsLink } from "inductions";

export const InductionPage = () => {
    const [ualAccount, _, ualShowModal] = useUALAccount();

    return (
        <SideNavLayout title="Membership" className="flex flex-col">
            {ualAccount ? (
                <InductionsContainer ualAccount={ualAccount} />
            ) : (
                <div className="flex-1 flex flex-col justify-center">
                    <CallToAction buttonLabel="登录" onClick={ualShowModal}>
                        歡迎來到Eden，請使用錢包登錄。
                    </CallToAction>
                    <PendingInvitationsLink />
                </div>
            )}
        </SideNavLayout>
    );
};

export default InductionPage;
