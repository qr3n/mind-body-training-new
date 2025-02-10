import { DraggableChildProps } from "@/shared/ui/draggable-list";
import { Block }                                        from "@/features/training/create/ui/templates/Block";
import { useAtom, useSetAtom }                          from "jotai";
import { addQuestionToBlock, blockAnswersAtomFamily, blockQuestionsAtomFamily } from "@/features/training/create/model";
import { Checkbox } from "@/shared/shadcn/ui/checkbox";
import { Button } from "@/shared/shadcn/ui/button";
import { PlusIcon } from "lucide-react";
import { Input } from "@/shared/shadcn/ui/input";
import React from "react";

interface QuestionProps {
    blockId: string;
}

export const QuestionList = ({ blockId }: QuestionProps) => {
    const [questions, setQuestions] = useAtom(blockAnswersAtomFamily(blockId));

    const handleAnswerChange = (index: number, answer: boolean) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index].isCorrect = answer;
        setQuestions(updatedQuestions);
    };

    const handleQuestionChange = (index: number, newQuestion: string) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index].text = newQuestion;
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
                        checked={question.isCorrect}
                        onClick={() => handleAnswerChange(index, !question.isCorrect)}
                        className="checkbox"
                    />
                    <input
                        type="text"
                        value={question.text}
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
    const [questionText, setQuestionText] = useAtom(blockQuestionsAtomFamily(props.id))

    const addQuestion = () => {
        addQuestion1({ blockId: props.id, question: 'Ответ' });
    };

    return (
        <Block color="white" level="first" label="TESTING" {...props}>
            <label className="text-sm -mb-2 ">Вопрос</label>
            <Input
                className="bg-gray-50 mt-2 rounded-lg max-w-[600px]"
                type="text"
                value={questionText}
                onChange={e => setQuestionText(e.target.value)}
                placeholder="Какое позитивное утверждение прозвучало в тренироке?"
            />
            <Button
            variant='ghost'
            onClick={addQuestion}
                className={`border mt-4 border-transparent hover:border-blue-500 hover:bg-blue-100 flex gap-2 py-5 bg-blue-50`}>
                <div
                    className='w-7 h-7 p-0 bg-blue-500 flex items-center justify-center hover:bg-blue-600 rounded-full'>
                    <PlusIcon className='w-5 h-5 text-white'/>
                </div>
                <span>ОТВЕТ</span>
            </Button>
            <QuestionList blockId={props.id} />
        </Block>
    );
};