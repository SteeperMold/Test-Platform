import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {ContentState, EditorState} from "draft-js";
import htmlToDraft from "html-to-draftjs";
import axios from "axios";
import TestConstructor from "./test_constructor";
import Question from "../components/QuestionsEdit";
import ErrorMessage from "../components/ErrorMessage";
import {baseURL} from "../App";
import '../static/css/presets.css';
import '../static/css/test_construcrtor.css';


const EditTest = () => {
    const {testId} = useParams();
    const [testData, setTestData] = useState(null);
    const [questions, setQuestions] = useState(undefined);
    const [editorState, setEditorState] = useState(undefined);


    useEffect(() => {
        axios.get(`${baseURL}/api/get_test_edit_data/${testId}/`)
            .then(response => {
                setTestData(response.data);

                if (response.data.error) {
                    return;
                }

                if (response.data.test.custom_diploma_template) {
                    const doc = new DOMParser().parseFromString(response.data.test.custom_diploma_template, 'text/html');
                    doc.querySelectorAll('style').forEach(tag => tag.remove());

                    setEditorState(EditorState.createWithContent(
                        ContentState.createFromBlockArray(htmlToDraft(doc.documentElement.outerHTML))
                    ));
                }

                setQuestions(response.data.questions.map((data, index) => {
                    if (data.image) {
                        axios.get(`${baseURL}/${data.image}`, {responseType: 'blob'})
                            .then(response => {
                                const imageBlob = new Blob([response.data]);
                                const file = new File([imageBlob], `img-${index}.jpg`, {
                                    type: "image/jpeg",
                                    lastModified: new Date().getTime()
                                }, 'utf-8');
                                const container = new DataTransfer();
                                container.items.add(file);
                                document.getElementById(`image-input-${index}`).files = container.files;
                            })
                            .catch(error => {
                                console.error(error);
                                setTestData({"error": "error loading image"});
                            });
                    }

                    let answerOptions = [];

                    if (data.answer_options) {
                        answerOptions = data.answer_options.map((text) => ({text: text}));
                    }

                    return <Question index={index} key={index} questionType={data.question_type}
                                     text={data.question_text} rightAnswer={data.answer_text}
                                     options={answerOptions} imageUrl={data.image}/>;
                }));
            })
            .catch(error => setTestData({"error": "error loading data"}));
    }, [testId]);

    return !testData ? <h1 className="center">Загрузка информации о тесте...</h1> : <>

        {testData.error === 'error loading data' &&
            <ErrorMessage message="При загрузке данных произошла ошибка"/>}

        {testData.error === 'error loading image' &&
            <ErrorMessage message="При загрузке изображения произошла ошибка"/>}

        {testData.error === 'test not found' &&
            <ErrorMessage message="Тест не найден"/>}

        {testData.error === 'not a creator' &&
            <ErrorMessage message="Вы не создатель этого теста"/>}

        {testData.error === 'questions not found' &&
            <ErrorMessage message="Некоректный тест"/>}

        {!testData.error && <TestConstructor formAction={`${baseURL}/test/${testId}/edit/`}
                                             defaultTestName={testData.test.title} defaultTheme={testData.test.theme}
                                             defaultQuestions={questions} defaultEditorState={editorState}
                                             defaultBackgroundImageURL={testData.test.diploma_background_image_url}/>}
    </>;
};

export default EditTest;