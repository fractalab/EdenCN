import { Button, Heading, Link, Text } from "_app";
import { ROUTES } from "_app/routes";

import { getInductionRemainingTimeDays, InductionNames } from "inductions";
import { Induction } from "inductions/interfaces";

export const WaitingForProfile = ({ induction }: { induction: Induction }) => {
    return (
        <>
            <Heading size={1} className="mb-5">
                等待受邀者
            </Heading>
            <div className="space-y-3 mb-8">
                <Text className="leading-normal">
                    我們正在等待{" "}
                    <span className="font-semibold">{induction.invitee}</span>{" "}
                    設置個人資料。
                </Text>
                <Text className="leading-normal">
                    被邀請人可以使用其EOS賬號登陸並在邀請模塊完善個人資料，亦可以直接分享此鏈接：
                </Text>
                <Text className="leading-normal break-all">
                    <Link href={window.location.href}>
                        {window.location.href}
                    </Link>
                </Text>
                <Text className="leading-normal font-medium">
                    注意，此邀請將在 {" "} {getInductionRemainingTimeDays(induction)} 日後過期。
                </Text>
                <InductionNames inductionId={induction.id} />
            </div>
            <Button href={ROUTES.INDUCTION.href} size="lg">
                成員面板
            </Button>
        </>
    );
};
