import React, {useState, useRef, useEffect} from "react";
import {Tooltip} from 'react-tippy';
import 'tippy.js/dist/tippy.css';
import plusSvg from '../static/svg/plus.svg'
import trashboxSvg from '../static/svg/trashbox.svg'
import tickSvg from '../static/svg/tick.svg';
import uploadImageSvg from '../static/svg/upload_image.svg';
import deleteImageSvg from '../static/svg/delete_image.svg';
import axios from "axios";
import {baseURL} from "../App";

const Question = ({
                      index,
                      questionType = "text",
                      text = "",
                      rightAnswer = "",
                      options = [],
                      imageUrl = null
                  }) => {
    const [type, setType] = useState(questionType);

    return <>
        {type === "text" && <TextQuestion index={index} type={type} setType={setType}
                                          text={text} rightAnswer={rightAnswer} imageUrl={imageUrl}/>}
        {type === "choice" && <ChoiceQuestion index={index} type={type} setType={setType} text={text}
                                              options={options} rightAnswer={rightAnswer} imageUrl={imageUrl}/>}
        {type === "name" && <NameQuestion index={index} type={type} setType={setType} text={text}
                                          imageUrl={imageUrl}/>}
        {type === "school_name" && <SchoolQuestion index={index} type={type} setType={setType} text={text}
                                                   imageUrl={imageUrl}/>}
    </>;
};

export default Question;

const QuestionTypeSelector = ({type, setType}) => {
    return (
        <select className="question-type-select" name="question_types" required value={type}
                onChange={(event) => setType(event.target.value)}>
            <option value="text">Ввод своего ответа</option>
            <option value="choice">Выбор ответа из вариантов</option>
            <option value="name">Имя и фамилия</option>
            <option value="school_name">Название образовательного учреждения</option>
        </select>
    );
};

const ImageUploadButton = ({questionIndex, imagePreviewRef, imageUrl}) => {
    const [imageFile, setImageFile] = useState(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (!imageUrl) {
            return;
        }

        axios.get(`${baseURL}/${imageUrl}`, {responseType: 'blob'})
            .then(response => {
                const imageBlob = new Blob([response.data]);
                const file = new File([imageBlob], `img-${questionIndex}.jpg`, {
                    type: 'image/jpeg',
                    lastModified: new Date().getTime()
                }, 'utf-8');
                setImageFile(file);
                imagePreviewRef.current.src = URL.createObjectURL(file);
                const container = new DataTransfer();
                container.items.add(file);
                inputRef.current.files = container.files;
            })
            .catch(error => console.error(error));
    }, [imagePreviewRef, imageUrl, questionIndex]);

    useEffect(() => {
        imagePreviewRef.current.src = imageFile ? URL.createObjectURL(imageFile) : '';
    }, [imageFile, imagePreviewRef]);

    const handleOnChange = event => setImageFile(event.target.files[0]);
    const uploadImage = () => inputRef.current.click();
    const deleteImage = () => {
        inputRef.current.value = "";
        setImageFile(null);
    }

    return <>
        <input type="file" accept="image/jpeg, image/png" id={`image-input-${questionIndex}`}
               name={`image[${questionIndex}]`} ref={inputRef} onChange={handleOnChange} hidden/>
        <Tooltip className="image-upload-tooltip" title="Загрузить изображение" position="bottom">
            <button type="button" onClick={uploadImage}>
                <img src={uploadImageSvg} alt="Добавить изображение"/>
            </button>
        </Tooltip>
        {imageFile && (
            <Tooltip className="image-upload-tooltip" title="Удалить изображение" position="bottom">
                <button type="button" onClick={deleteImage}>
                    <img src={deleteImageSvg} alt="Добавить изображение"/>
                </button>
            </Tooltip>
        )}
    </>;
};

const TextQuestion = ({index, type, setType, text, rightAnswer, imageUrl}) => {
    const imagePreviewRef = useRef(null);

    return (
        <div className="question">
            <div className="question-header">
                <input className="question-name-input" name="question_texts" placeholder="Вопрос" autoComplete="off"
                       defaultValue={text} required/>
                <ImageUploadButton imagePreviewRef={imagePreviewRef} questionIndex={index} imageUrl={imageUrl}/>
                <QuestionTypeSelector type={type} setType={setType}/>
            </div>
            <img ref={imagePreviewRef} className="image-preview"/>
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
                <img src={tickSvg} alt="Отметить правильным"/>
            </button>
        </Tooltip>
    </div>;
};

const ChoiceQuestion = ({index, type, setType, text, options, rightAnswer, imageUrl}) => {
    const [rightAnswerIndex, setRightAnswerIndex] = useState(0);
    const [answerOptions, setAnswerOptions] = useState(options.length !== 0 ? [{text: rightAnswer}, ...options] : [{}, {}]);
    const imagePreviewRef = useRef(null);

    const addAnswerOption = () => setAnswerOptions([...answerOptions, {}]);
    const deleteAnswerOption = () => answerOptions.length > 2 && setAnswerOptions(answerOptions.slice(0, -1));

    return (
        <Tooltip title="Не выбран правильный ответ!" open={rightAnswerIndex >= answerOptions.length}
                 position="left" className="question">
            <div className="question-header">
                <input className="question-name-input" name="question_texts" placeholder="Вопрос"
                       defaultValue={text} autoComplete="off" required/>
                <ImageUploadButton imagePreviewRef={imagePreviewRef} questionIndex={index} imageUrl={imageUrl}/>
                <QuestionTypeSelector type={type} setType={setType}/>
            </div>
            <img ref={imagePreviewRef} className="image-preview"/>
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
                        <img src={plusSvg} alt="Добавить вариант ответа"/>
                    </button>
                </Tooltip>
                <Tooltip className="delete-answer-option-tooltip" title="Удалить вариант ответа"
                         style={{visibility: `${answerOptions.length > 2 ? "visible" : "hidden"}`}}
                         position="bottom" theme="dark">
                    <button type="button" className="delete-button" onClick={deleteAnswerOption}>
                        <img src={trashboxSvg} alt="Удалить вариант ответа"/>
                    </button>
                </Tooltip>
            </div>
        </Tooltip>
    );
};

const NameQuestion = ({index, type, setType, text, imageUrl}) => {
    const imagePreviewRef = useRef(null);

    return (
        <div className="question">
            <div className="question-header">
                <input className="question-name-input" name="question_texts"
                       placeholder="Просьба представиться" autoComplete="off"
                       defaultValue={text || "Представьтесь, пожалуйста!"} required/>
                <ImageUploadButton questionIndex={index} imagePreviewRef={imagePreviewRef} imageUrl={imageUrl}/>
                <QuestionTypeSelector type={type} setType={setType}/>
            </div>
            <img ref={imagePreviewRef} className="image-preview"/>
        </div>
    );
};

const SchoolQuestion = ({index, type, setType, text, imageUrl}) => {
    const imagePreviewRef = useRef(null);

    return (
        <div className="question">
            <div className="question-header">
                <input className="question-name-input" name="question_texts"
                       placeholder="Просьба ввести название образовательного учреждения"
                       autoComplete="off" defaultValue={text || "Где вы учитесь?"} required/>
                <ImageUploadButton imagePreviewRef={imagePreviewRef} questionIndex={index} imageUrl={imageUrl}/>
                <QuestionTypeSelector type={type} setType={setType}/>
            </div>
            <img ref={imagePreviewRef} className="image-preview"/>
        </div>
    );
};
