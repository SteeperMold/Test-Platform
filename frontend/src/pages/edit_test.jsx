import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import axios from "axios";
import CSRFToken from "../components/CSRFToken";
import DiplomaEditor from "../components/DiplomaEditor";
import {ContentState, convertToRaw, EditorState} from 'draft-js';
import htmlToDraft from 'html-to-draftjs';
import draftToHtml from 'draftjs-to-html';
import Question, {AnswerOption} from "../components/QuestionsEdit";
import ErrorMessage from "../components/ErrorMessage";
import Controls from "../components/Controls";
import '../static/css/presets.css';
import '../static/css/test_construcrtor.css';
import {baseURL} from "../App";


const EditTest = () => {
    const [testData, setTestData] = useState(null);
    const {test_id} = useParams();
    // edit test tab
    const [activeTab, setActiveTab] = useState(1);
    const [questions, setQuestions] = useState([]);
    // edit diploma tab
    const [editorOpen, setEditorOpen] = useState(false);
    const [editorState, setEditorState] = useState(EditorState.createEmpty());


    const convertDataToComponents = (data, index) => {
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

        let answerOptions = undefined;

        if (data.answer_options) {
            answerOptions = data.answer_options.map((text, optionIndex) => <AnswerOption index={index} key={optionIndex}
                                                                                         text={text}/>)
        }

        return <Question index={index} key={index} questionType={data.question_type}
                         text={data.question_text} rightAnswer={data.answer_text}
                         options={answerOptions} imageURL={data.image}/>;
    };

    useEffect(() => {
        axios.get(`${baseURL}/api/get_test_edit_data/${test_id}/`)
            .then(response => {
                setTestData(response.data);

                if (!response.data.error) {
                    setQuestions(response.data.questions.map(convertDataToComponents));

                    if (response.data.test.custom_diploma_template) {
                        setEditorState(EditorState.createWithContent(
                            ContentState.createFromBlockArray(
                                htmlToDraft(response.data.test.custom_diploma_template)
                            )
                        ));
                    }
                }
            })
            .catch(error => {
                console.error(error);
                setTestData({"error": "error loading data"});
            });
    }, []);

    const submitTest = () => {
        if (editorOpen) {
            const rawContentState = convertToRaw(editorState.getCurrentContent());
            document.getElementById('template-input').value = draftToHtml(rawContentState);
        }
    };

    return (
        <>
            {!testData ? <h1 style={{textAlign: "center"}}>Загрузка информации о тесте...</h1> :
                <>
                    {testData.error === 'error loading data' &&
                        <ErrorMessage message="При загрузке данных произошла ошибка"/>}
                    {testData.error === 'error loading image' &&
                        <ErrorMessage message="При загрузке изображения произошла ошибка"/>}
                    {testData.error === 'test not found' && <ErrorMessage message="Тест не найден"/>}
                    {testData.error === 'not a creator' && <ErrorMessage message="Вы не создатель этого теста"/>}
                    {testData.error === 'questions not found' && <ErrorMessage message="Некоректный тест"/>}
                    {!testData.error && (
                        <>
                            <div className="tab-buttons-container">
                                <button className={`tab-button ${activeTab === 1 ? 'active' : ''}`}
                                        onClick={() => setActiveTab(1)}
                                        type="button" id="edit-test-tab">Редактировать тест
                                </button>
                                <button className={`tab-button ${activeTab === 2 ? 'active' : ''}`}
                                        onClick={() => setActiveTab(2)}
                                        type="button" id="edit-diploma-tab">Редактировать диплом
                                </button>
                            </div>

                            <form action={`${baseURL}/test/${test_id}/edit/`}
                                  method="post" id="create-test-form" encType="multipart/form-data">
                                <CSRFToken/>

                                <div id="edit-test-content" className="tab-content"
                                     style={{display: `${activeTab === 1 ? "flex" : "none"}`}}>
                                    <input id="test-name-input" type="text" defaultValue={`${testData.test.title}`}
                                           name="title" placeholder="Название теста" autoComplete="off" required/>
                                    <input id="test-theme-input" type="text" defaultValue={`${testData.test.theme}`}
                                           name="theme" placeholder="Тема теста" autoComplete="off" required/>

                                    <div className="questions-container">{questions}</div>

                                    <Controls questions={questions} setQuestions={setQuestions}/>

                                    <button id="test-constructor-submit-button" type="submit"
                                            className="button1" onClick={submitTest}>
                                        Изменить тест →
                                    </button>
                                </div>

                                <div id="edit-diploma-content" className="tab-content"
                                     style={{display: `${activeTab === 2 ? "flex" : "none"}`}}>
                                    {(testData.test.custom_diploma_template || editorOpen) &&
                                        <DiplomaEditor editorState={editorState} setEditorState={setEditorState}/>}
                                    {!testData.test.custom_diploma_template && !editorOpen && (
                                        <>
                                            <h3>
                                                Чтобы изменить шаблон диплома, выдающегося после прохождения теста, вы
                                                можете воспользоваться редактором
                                            </h3>

                                            <button className="button1" type="button"
                                                    onClick={() => setEditorOpen(true)}>
                                                Использовать редактор
                                            </button>
                                        </>
                                    )}

                                    <input type="hidden" id="template-input" name="diploma_template"
                                           className="template-input" accept="text/html"/>
                                </div>
                            </form>
                        </>
                    )}
                </>
            }
        </>
    );
}

export default EditTest;
