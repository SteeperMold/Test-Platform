import React from "react";
import {Tooltip} from "react-tippy";
import Question from "./QuestionsEdit";
import plus_svg from "../static/svg/plus.svg";
import trashbox_svg from "../static/svg/trashbox.svg";
import '../static/css/controls.css';

const Controls = ({questions, setQuestions}) => {
    return (
        <>
            <div className="controls">
                <Tooltip title="Добавить вопрос" position="bottom">
                    <button type="button" id="add-question-button" className="add-button"
                            onClick={() => setQuestions([...questions,
                                <Question index={questions.length} key={questions.length}/>])}>
                        <img src={plus_svg} alt="Добавить вопрос"/>
                    </button>
                </Tooltip>
                <Tooltip title="Удалить вопрос" position="bottom"
                         style={{visibility: `${questions.length > 1 ? "visible" : "hidden"}`}}>
                    <button type="button" id="delete-question-button" className="delete-button"
                            onClick={() => questions.length > 1 && setQuestions(questions.slice(0, -1))}>
                        <img src={trashbox_svg} alt="Удалить вопрос"/>
                    </button>
                </Tooltip>
            </div>
        </>
    );
};

export default Controls;