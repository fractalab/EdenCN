import { CallToAction } from "_app";
import { ROUTES } from "_app/routes";

interface InviteBannerProps {
    canInvite?: boolean;
}

export const InviteBanner = ({ canInvite }: InviteBannerProps) => {
    if (!canInvite) return null;
    return (
        <CallToAction
            buttonLabel="邀請"
            dataTestId="invite-button"
            href={`${ROUTES.INDUCTION.href}/init`}
        >
            眾人拾柴火焰高。邀請你信任的人加入 Eden 吧！
        </CallToAction>
    );
};
