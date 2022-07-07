import { Text } from "_app";
import { getInductionRemainingTimeDays } from "inductions";
import { Induction } from "inductions/interfaces";

export const InductionExpiresIn = ({ induction }: { induction: Induction }) => (
    <Text className="mb-4">
        注意，此邀請將在 {getInductionRemainingTimeDays(induction)}日後過期。
    </Text>
);
