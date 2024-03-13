import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import axios from "axios";
import CSRFToken from "../components/CSRFToken";
import Question, {AnswerOption} from "../components/Questions";
import ErrorMessage from "../components/ErrorMessage";
import '../static/css/test.css';
import '../static/css/presets.css';
import {baseURL} from "../App";


const Test = () => {
    const [testData, setTestData] = useState(null);
    const {test_id} = useParams();

    const [questions, setQuestions] = useState([]);

    const convertDataToComponents = (data, index) => {
        let answerOptions = undefined;

        if (data.answer_options) {
            answerOptions = data.answer_options.map((text, optionIndex) => <AnswerOption index={index} key={optionIndex}
                                                                                         text={text}/>);
        }

        return <Question index={index} key={index} questionText={data.question_text}
                         questionType={data.question_type} answerOptions={answerOptions} imageURL={data.image}/>
    };

    useEffect(() => {
        axios.get(`${baseURL}/api/get_test_data/${test_id}/`)
            .then(response => {
                setTestData(response.data);
                setQuestions(response.data.questions.map(convertDataToComponents));
            })
            .catch(error => {
                console.error(error);
                setTestData({"error": "error loading data"});
            });
    }, [test_id]);

    return (
        <>
            {!testData ? <h1 style={{textAlign: "center"}}>Загрузка информации о тесте...</h1> :
                <>
                    {testData.error === 'error loading data' &&
                        <ErrorMessage message="При загрузке данных произошла ошибка"/>}
                    {testData.error === 'test not found' && <ErrorMessage message="Тест не найден"/>}
                    {testData.error === 'questions not found' && <ErrorMessage message="Некоректный тест"/>}
                    {!testData.error && (
                        <div className="test">
                            <h1>Тест</h1>
                            <h2>{testData.test.title}</h2>

                            <form action={`${baseURL}/test/${test_id}/`} method="post">
                                <CSRFToken/>

                                {questions}

                                <button type="submit" className="button1">Проверить →</button>
                            </form>
                        </div>
                    )}
                </>
            }
        </>
    );
};

export default Test;

