import React from "react";
import {baseURL} from "../App";

const Question = ({index, questionText, questionType, answerOptions = null, imageURL = null}) => {
    return <>
        {questionType === "text" && <TextQuestion index={index} questionText={questionText} imageUrl={imageURL}/>}
        {questionType === 'choice' && <ChoiceQuestion index={index} questionText={questionText}
                                                      answerOptions={answerOptions} imageUrl={imageURL}/>}
        {questionType === 'name' && <NameQuestion index={index} questionText={questionText} imageUrl={imageURL}/>}
        {questionType === 'school_name' && <SchoolQuestion index={index} questionText={questionText}
                                                           imageUrl={imageURL}/>}
    </>;
};

export default Question;

const TextQuestion = ({index, questionText, imageUrl}) => {
    return (
        <div className="question text-question">
            <h3>{questionText}</h3>
            {imageUrl && <img className="image-in-test" src={`${baseURL}/${imageUrl}`}
                              alt="Не удалось загрузить изображение"/>}
            <input className="input-default" type="text" name={`answer[${index}]`}
                   placeholder="Введите ответ" autoComplete="off" required/>
        </div>
    );
};

export const AnswerOption = ({index, text}) => {
    return <>
        <input type="radio" name={`answer[${index}]`} value={text}/>
        <p>{text}</p>
    </>;
};

const ChoiceQuestion = ({index, questionText, answerOptions, imageUrl}) => {
    let optionsTable = [];
    let row = [];

    for (let i = 0; i !== answerOptions.length; i++) {
        if (i % 2 === 0 && i !== 0) {
            optionsTable.push(<tr key={i}>{row}</tr>);
            row = [];
        }
        row.push(<td key={i}>{answerOptions[i]}</td>);
    }

    optionsTable.push(<tr key={answerOptions.length}>{row}</tr>);

    return (
        <div className="question choice-question">
            <h3>{questionText}</h3>
            {imageUrl && <img className="image-in-test" src={`${baseURL}/${imageUrl}`}
                              alt="Не удалось загрузить изображение"/>}
            <table>
                <tbody>
                {optionsTable}
                </tbody>
            </table>
        </div>
    );
};

const NameQuestion = ({index, questionText, imageUrl}) => {
    return (
        <div className="question name-question">
            <h3>{questionText}</h3>
            {imageUrl && <img className="image-in-test" src={`${baseURL}/${imageUrl}`}
                              alt="Не удалось загрузить изображение"/>}

            <div className="inputs">
                <input className="input-narrow" name="users_name" placeholder="Ваше имя" autoComplete="off" required/>
                <input className="input-narrow" name="users_surname" placeholder="Ваша фамилия" autoComplete="off"
                       required/>
            </div>
        </div>
    );
};

const SchoolQuestion = ({index, questionText, imageUrl}) => {
    return (
        <div className="question school-question">
            <h3>{questionText}</h3>
            {imageUrl && <img className="image-in-test" src={`${baseURL}/${imageUrl}`}
                              alt="Не удалось загрузить изображение"/>}

            <input className="input-default" name="school_name" placeholder="Ваше образовательное учреждение"
                   autoComplete="off" required/>
        </div>
    );
}

