import { Container, Heading, Link, Text } from "_app";

interface Props {
    className?: string;
}

export const WelcomeText = ({ className = "" }: Props) => (
    <div className={className}>
        <Container className="grid grid-cols-2 gap-2.5 lg:gap-4">
            <FirstParagraph className="col-span-2 lg:col-span-1" />
            <SecondParagraph className="col-span-2 lg:col-span-1" />
        </Container>
    </div>
);

export default WelcomeText;

const FirstParagraph = ({ className = "" }: { className?: string }) => (
    <div className={"space-y-2.5 " + className}>
        <Heading size={2}>歡迎來到 Eden</Heading>
        <Text>
        團隊的力量，可以遠超成員的力量之和。但一個團隊，需要一種合適的方式來達成共識，否則將會分崩離析。Eden致力于探索、研究，並通過不斷的模擬實踐，找到適合社區的治理模型.
        </Text>
    </div>
);

const SecondParagraph = ({ className = "" }: { className?: string }) => (
    <div className={"space-y-2.5 " + className}>
        <Text>
        EdenOS 是一種全新的治理決策流程。EdenOS 保護並增強參與者的獨立性與話語權。通過加入 Eden 社區，你將結識一群志同道合的夥伴，並為了大家的理想攜手探索與努力。
        </Text>
        <Text>
            想瞭解更多有關 Eden 的信息，以及如何參與，請訪問：{" "}
            <Link
                href="http://eden.eoscommunity.org"
                target="_blank"
                isExternal
            >
                eden.eoscommunity.org
            </Link>
            .
        </Text>
    </div>
);
