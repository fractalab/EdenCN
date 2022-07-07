import dayjs from "dayjs";

import { tokenConfig } from "config";
import { Container, Heading, Text, useDistributionState } from "_app";

export const TreasuryDisbursementsInfo = () => {
    const { data: distributionState } = useDistributionState();

    const nextDisbursementTime =
        distributionState &&
        dayjs(distributionState.data.distribution_time + "Z").format("LL");

    return (
        <Container className="space-y-2.5">
            <Heading size={2}>每月資金分配情況</Heading>
            <Text>
                Eden 會按月給社區代表分配資金。社區代表需要通過關聯的{" "} {tokenConfig.symbol} 賬號向合約發起確認分配操作。
            </Text>
            <Text>
                每月分配給代表的資金總額為社區金庫當前餘額的5%。這些資金將平均分配給每一個層級，每個層級內的代表將平均分配其對應層級內的資金。
            </Text>
            {nextDisbursementTime && (
                <Text>
                    下一次分配時間：{" "}
                    <span className="font-medium">{nextDisbursementTime}</span>
                </Text>
            )}
        </Container>
    );
};

export default TreasuryDisbursementsInfo;
