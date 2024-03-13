import React, {useState} from "react";
import {Tooltip} from 'react-tippy';
import 'tippy.js/dist/tippy.css';
import plus_svg from '../static/svg/plus.svg'
import trashbox_svg from '../static/svg/trashbox.svg'

const Question = ({
                      index,
                      questionType = "text",
                      text = "",
                      rightAnswer = "",
                      options = [<AnswerOption index={index} key={index}/>],
                      imageURL = null
                  }) => {
    const [type, setType] = useState(questionType);

    return (
        <>
            {type === "text" && <TextQuestion index={index} type={type} setType={setType}
                                              text={text} rightAnswer={rightAnswer}/>}
            {type === "choice" && <ChoiceQuestion index={index} type={type} setType={setType}
                                                  text={text} options={options} rightAnswer={rightAnswer}/>}
            {type === "image" && <ImageQuestion index={index} type={type} setType={setType}
                                                text={text} rightAnswer={rightAnswer} imageURL={imageURL}/>}
            {type === "name" && <NameQuestion index={index} type={type} setType={setType} text={text}/>}
            {type === "school_name" && <SchoolQuestion index={index} type={type} setType={setType} text={text}/>}
        </>
    );
};
export default Question;

const QuestionTypeSelector = ({type, setType}) => {
    return (
        <select className="question-type-select" name="question_types" required value={type}
                onChange={(event) => setType(event.target.value)}>
            <option value="text">Ввод своего ответа</option>
            <option value="choice">Выбор ответа из вариантов</option>
            <option value="image">Вопрос по картинке</option>
            <option value="name">Имя и фамилия</option>
            <option value="school_name">Название образовательного учреждения</option>
        </select>
    );
};

const TextQuestion = ({index, type, setType, text, rightAnswer}) => {
    return (
        <div className="question">
            <div className="question-header">
                <input className="question-name-input" name="question_texts" placeholder="Вопрос" autoComplete="off"
                       defaultValue={text} required/>
                <QuestionTypeSelector type={type} setType={setType}/>
            </div>
            <div className="question-answers">
                <input className="question-right-answer-input" name={`answer_text[${index}]`}
                       placeholder="Правильный ответ" defaultValue={rightAnswer} autoComplete="off" required/>
            </div>
        </div>
    );
};

export const AnswerOption = ({index, text = ""}) => {
    return <input className="answer-option-input" name={`option_texts[${index}]`}
                  defaultValue={text} placeholder="Вариант ответа" autoComplete="off" required/>;
};

const ChoiceQuestion = ({index, type, setType, text, options, rightAnswer}) => {
    const [answerOptions, setAnswerOptions] = useState(options);

    return (
        <div className="question">
            <div className="question-header">
                <input className="question-name-input" name="question_texts" placeholder="Вопрос"
                       defaultValue={text} autoComplete="off" required/>
                <QuestionTypeSelector type={type} setType={setType}/>
            </div>
            <div className="question-answers">
                <input className="question-right-answer-input" name={`answer_text[${index}]`}
                       defaultValue={rightAnswer} placeholder="Правильный ответ" autoComplete="off" required/>
                {answerOptions}
            </div>
            <div className="answer-options-controls">
                <Tooltip title="Добавить вариант ответа" position="bottom" theme="dark">
                    <button type="button" id="add-answer-option-button" className="add-button"
                            onClick={() => setAnswerOptions([...answerOptions,
                                <AnswerOption index={index} key={answerOptions.length}/>])}>
                        <img src={plus_svg} alt="Добавить вариант ответа"/>
                    </button>
                </Tooltip>
                <Tooltip title="Удалить вариант ответа" position="bottom" theme="dark"
                         style={{visibility: `${answerOptions.length > 1 ? "visible" : "hidden"}`}}>
                    <button type="button" id="delete-answer-option-button" className="delete-button"
                            onClick={() => answerOptions.length > 1 && setAnswerOptions(answerOptions.slice(0, -1))}>
                        <img src={trashbox_svg} alt="Удалить вариант ответа"/>
                    </button>
                </Tooltip>
            </div>
        </div>
    );
};

const ImageQuestion = ({index, type, setType, text, rightAnswer, imageURL}) => {
    const [imageFile, setImageFile] = useState(null);

    return (
        <div className="question">
            <div className="question-header">
                <input className="question-name-input" name="question_texts" placeholder="Вопрос" autoComplete="off"
                       defaultValue={text} required/>
                <QuestionTypeSelector type={type} setType={setType}/>
            </div>
            <label className="image-input-label" htmlFor={`image-input-${index}`}>Загрузить изображение</label>
            <div className="image-preview">
                {imageFile && <img src={URL.createObjectURL(imageFile)} alt="Превью изображения"/>}
                {imageURL && <img src={`http://localhost:8000/${imageURL}`} alt="Превью изображения"/>}
            </div>
            <div className="question-answers">
                <input className="image-input" id={`image-input-${index}`} type="file"
                       name={`image[${index}]`} accept="image/jpeg, image/png"
                       onChange={(event) => {
                           setImageFile(event.target.files[0]);
                       }}/>
                <input className="question-right-answer-input" name={`answer_text[${index}]`}
                       defaultValue={rightAnswer} placeholder="Правильный ответ" autoComplete="off" required/>
            </div>
        </div>
    );
};

const NameQuestion = ({index, type, setType, text}) => {
    return (
        <div className="question">
            <div className="question-header">
                <input className="question-name-input" name="question_texts"
                       placeholder="Просьба представиться" autoComplete="off"
                       defaultValue={text || "Представьтесь, пожалуйста!"} required/>
                <QuestionTypeSelector type={type} setType={setType}/>
            </div>
        </div>
    );
};

const SchoolQuestion = ({index, type, setType, text}) => {
    return (
        <div className="question">
            <div className="question-header">
                <input className="question-name-input" name="question_texts"
                       placeholder="Просьба ввести название образовательного учреждения"
                       autoComplete="off" defaultValue={text || "Где вы учитесь?"} required/>
                <QuestionTypeSelector type={type} setType={setType}/>
            </div>
        </div>
    );
};
