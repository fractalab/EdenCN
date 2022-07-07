import { Container, Heading, Button } from "_app";

interface Props {
    className?: string;
}

export const LearnMoreCTA = ({ className = "" }: Props) => (
    <div className={className}>
        <Container className="space-y-2.5">
            <Heading size={3}>
                Eden是一場由社區自發的針對發展、治理與協作進行的探索，研究及模擬。
            </Heading>
            <Button
                href="http://eden.eoscommunity.org"
                className="flex-shrink-0 mt-10 sm:mt-0"
                target="_blank"
                isExternal
            >
                了解更多
            </Button>
        </Container>
    </div>
);

export default LearnMoreCTA;
