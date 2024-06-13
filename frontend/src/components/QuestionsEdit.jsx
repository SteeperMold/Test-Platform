import React, {useState} from "react";
import {Tooltip} from 'react-tippy';
import 'tippy.js/dist/tippy.css';
import plus_svg from '../static/svg/plus.svg'
import trashbox_svg from '../static/svg/trashbox.svg'
import tick_svg from '../static/svg/tick.svg';

const Question = ({
                      index,
                      questionType = "text",
                      text = "",
                      rightAnswer = "",
                      options = [],
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

export const AnswerOption = ({
                                 questionIndex,
                                 optionIndex,
                                 rightAnswerIndex,
                                 setRightAnswerIndex,
                                 text = ""
                             }) => {
    const [inputContent, setInputContent] = useState(text);
    const [isLabelVisible, setIsLabelVisible] = useState(inputContent.length !== 0 && inputContent.length < 30);
    const [isButtonVisible, setIsButtonVisible] = useState(false);

    const handleOnInput = (event) => {
        setInputContent(event.target.value);
        const inputLen = event.target.value.length;
        setIsLabelVisible(inputLen !== 0 && inputLen < 30);
    };

    return <div className="answer-option-container"
                onMouseEnter={() => setIsButtonVisible(true)} onMouseLeave={() => setIsButtonVisible(false)}>
        {optionIndex === rightAnswerIndex ? <>
            <div className="question-right-answer-input-container">
                <input className="question-right-answer-input" id={`answer-input-${questionIndex}-${optionIndex}`}
                       name={`answer_text[${questionIndex}]`} defaultValue={inputContent} placeholder="Правильный ответ"
                       autoComplete="off" required onInput={handleOnInput}/>
                <label htmlFor={`answer-input-${questionIndex}-${optionIndex}`}
                       style={{
                           opacity: `${isLabelVisible ? 1 : 0}`,
                           visibility: `${isLabelVisible ? 'visible' : 'hidden'}`
                       }}>
                    Правильный ответ
                </label>
            </div>
        </> : (
            <input className="answer-option-input" name={`option_texts[${questionIndex}]`}
                   defaultValue={inputContent} placeholder="Вариант ответа" autoComplete="off" required
                   onInput={handleOnInput}/>
        )}

        <Tooltip className="correct-option-tooltip" title="Отметить вариант ответа правильным"
                 style={{opacity: `${isButtonVisible ? 1 : 0}`}}
                 position="bottom" theme="dark">
            <button type="button" onClick={() => setRightAnswerIndex(optionIndex)}>
                <img src={tick_svg} alt="Отметить правильным"/>
            </button>
        </Tooltip>
    </div>;
};

const ChoiceQuestion = ({index, type, setType, text, options, rightAnswer}) => {
    const [rightAnswerIndex, setRightAnswerIndex] = useState(0);
    const [answerOptions, setAnswerOptions] = useState(options.length !== 0 ? [{text: rightAnswer}, ...options] : [{}, {}]);

    const addAnswerOption = () => setAnswerOptions([...answerOptions, {}]);
    const deleteAnswerOption = () => answerOptions.length > 2 && setAnswerOptions(answerOptions.slice(0, -1));

    return (
        <Tooltip title="Не выбран правильный ответ!" open={rightAnswerIndex >= answerOptions.length}
                 position="top" className="question">
            <div className="question-header">
                <input className="question-name-input" name="question_texts" placeholder="Вопрос"
                       defaultValue={text} autoComplete="off" required/>
                <QuestionTypeSelector type={type} setType={setType}/>
            </div>
            <div className="question-answers">
                {answerOptions.map((option, optionIndex) => (
                    <AnswerOption questionIndex={index} optionIndex={optionIndex} key={optionIndex}
                                  rightAnswerIndex={rightAnswerIndex} setRightAnswerIndex={setRightAnswerIndex}
                                  text={option.text}/>
                ))}
            </div>
            <div className="answer-options-controls">
                <Tooltip className="add-answer-option-tooltip" title="Добавить вариант ответа"
                         position="bottom" theme="dark">
                    <button type="button" className="add-button" onClick={addAnswerOption}>
                        <img src={plus_svg} alt="Добавить вариант ответа"/>
                    </button>
                </Tooltip>
                <Tooltip className="delete-answer-option-tooltip" title="Удалить вариант ответа"
                         style={{visibility: `${answerOptions.length > 2 ? "visible" : "hidden"}`}}
                         position="bottom" theme="dark">
                    <button type="button" className="delete-button" onClick={deleteAnswerOption}>
                        <img src={trashbox_svg} alt="Удалить вариант ответа"/>
                    </button>
                </Tooltip>
            </div>
        </Tooltip>
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
                       onChange={(event) => setImageFile(event.target.files[0])}/>
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
