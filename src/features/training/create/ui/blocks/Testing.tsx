import { DraggableChildProps } from "@/shared/ui/draggable-list";
import { Block }                                        from "@/features/training/create/ui/templates/Block";
import { useAtom, useSetAtom }                          from "jotai";
import { addQuestionToBlock, blockQuestionsAtomFamily } from "@/features/training/create/model";
import { Checkbox } from "@/shared/shadcn/ui/checkbox";

interface QuestionProps {
    blockId: string;
}

export const QuestionList = ({ blockId }: QuestionProps) => {
    const [questions, setQuestions] = useAtom(blockQuestionsAtomFamily(blockId));

    const handleAnswerChange = (index: number, answer: boolean) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index].answer = answer;
        setQuestions(updatedQuestions);
    };

    const handleQuestionChange = (index: number, newQuestion: string) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index].question = newQuestion;
        setQuestions(updatedQuestions);
    };

    return (
        <div className='space-y-4 mt-4'>
            {questions.map((question, index) => (
                <div
                    key={index}
                    className="border items-center flex gap-3 select-none w-full p-4 bg-white rounded-xl shadow-sm"
                >
                    <Checkbox
                        checked={question.answer === true}
                        onClick={() => handleAnswerChange(index, !question.answer)}
                        className="checkbox"
                    />
                    <input
                        type="text"
                        value={question.question}
                        onChange={(e) => handleQuestionChange(index, e.target.value)}
                        className="text-gray-700 border-none outline-none w-full"
                    />
                </div>
            ))}
        </div>
    );
};
export const Testing = (props: DraggableChildProps) => {
    const addQuestion1 = useSetAtom(addQuestionToBlock)

    const addQuestion = () => {
        addQuestion1({ blockId: props.id, question: 'Вопрос' });
    };

    return (
        <Block color="white" level="first" label="TESTING" {...props}>
            <button onClick={addQuestion}>Добавить вопрос</button>
            <QuestionList blockId={props.id} />
        </Block>
    );
};