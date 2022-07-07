import { Button } from "_app";
import { InductionStepsContainer, InductionStepInvitee } from "inductions";

export const GetAnInviteCTA = () => {
    return (
        <InductionStepsContainer step={InductionStepInvitee.GetInvite}>
            <>
                <p className="mb-10 text-2xl font-medium title-font text-gray-900">
                    準備好加入Eden了？請聯繫現有成員，獲得邀請。
                </p>
                <Button
                    href="https://www.notion.so/edenos/Getting-an-Invite-2d38947d5be94dcb84dfa1ae48894802"
                    size="lg"
                    target="_blank"
                    isExternal
                >
                    了解更多
                </Button>
            </>
        </InductionStepsContainer>
    );
};
