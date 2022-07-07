import React from "react";
import {
    CallToAction,
    Card,
    MemberStatus,
    SideNavLayout,
    useCurrentMember,
    useUALAccount,
} from "_app";
import { GetAnInviteCTA, InductionInviteFormContainer } from "inductions";

export const InitInductionPage = () => {
    const [ualAccount, _, ualShowModal] = useUALAccount();
    const { data: member, isLoading } = useCurrentMember();

    const getPageTitle = () => {
        if (!ualAccount) return "Sign in";
        if (member?.status !== MemberStatus.ActiveMember) return "Membership";
        return "Invite";
    };

    const renderContents = () => {
        if (!ualAccount) {
            return (
                <CallToAction buttonLabel="登录" onClick={ualShowModal}>
                    歡迎來到 Eden. 使用錢包登陸.
                </CallToAction>
            );
        }

        if (isLoading) {
            return <Card title="正在加載...">...</Card>;
        }

        if (member?.status !== MemberStatus.ActiveMember) {
            return <GetAnInviteCTA />;
        }

        return <InductionInviteFormContainer ualAccount={ualAccount} />;
    };

    return (
        <SideNavLayout title={getPageTitle()}>{renderContents()}</SideNavLayout>
    );
};

export default InitInductionPage;
