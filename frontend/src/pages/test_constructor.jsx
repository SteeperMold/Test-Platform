import React, {useState} from "react";
import 'react-tippy/dist/tippy.css';
import CSRFToken from "../components/CSRFToken";
import Question from '../components/QuestionsEdit';
import DiplomaEditor from "../components/DiplomaEditor";
import Controls from "../components/Controls";
import {convertToRaw, EditorState} from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import "../static/css/test_construcrtor.css";
import "../static/css/presets.css";
import {baseURL} from "../App";


const TestConstructor = () => {
    // edit test tab
    const [activeTab, setActiveTab] = useState(1);
    const [questions, setQuestions] = useState([<Question index={0} key={0}/>]);
    // edit diploma tab
    const [editorOpen, setEditorOpen] = useState(false);
    const [editorState, setEditorState] = useState(EditorState.createEmpty());
    const [backgroundImageURL, setBackgroundImageURL] = useState(null);

    const submitTest = (event) => {
        if (editorOpen) {
            const rawContentState = convertToRaw(editorState.getCurrentContent());
            let content = draftToHtml(rawContentState);
            if (backgroundImageURL) {
                content += `<style>body{background-image:url("${backgroundImageURL}");background-repeat:no-repeat;background-position-x:center;background-position-y:center;background-size:contain;}</style>`;
            }
            document.getElementById('template-input').value = content;
        }

        for (let i = 0; i !== questions.length; i++) {
            if (document.querySelector(`form input[name="answer_text[${i}]"]`) === null) {
                event.preventDefault();
                document.getElementsByClassName('question')[i].scrollIntoView({behavior: "smooth"});
            }
        }
    };

    return (
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
            <form action={`${baseURL}/create-test/`} method="post" encType="multipart/form-data">
                <CSRFToken/>

                <div id="edit-test-content" className="tab-content"
                     style={{display: `${activeTab === 1 ? "flex" : "none"}`}}>
                    <input id="test-name-input" type="text" name="title" placeholder="Название теста"
                           autoComplete="off" required/>
                    <input id="test-theme-input" type="text" name="theme" placeholder="Тема теста"
                           autoComplete="off" required/>

                    <div className="questions-container" id="questions-container">
                        {questions}
                    </div>

                    <Controls questions={questions} setQuestions={setQuestions}/>

                    <button id="test-constructor-submit-button" type="submit" className="button1" onClick={submitTest}>
                        Создать тест →
                    </button>
                </div>
                <div id="edit-diploma-content" className="tab-content"
                     style={{display: `${activeTab === 2 ? "flex" : "none"}`}}>

                    {!editorOpen ? (
                        <>
                            <h3>
                                Чтобы изменить шаблон диплома, выдающегося после прохождения теста, вы можете
                                воспользоваться редактором
                            </h3>

                            <button className="button1" onClick={() => setEditorOpen(true)}>
                                Использовать редактор
                            </button>
                        </>
                    ) : (
                        <DiplomaEditor editorState={editorState} setEditorState={setEditorState}
                                       setBackgroundImageURL={setBackgroundImageURL}/>
                    )}

                    <input type="hidden" id="template-input" name="diploma_template"
                           className="template-input" accept="text/html"/>
                </div>
            </form>
        </>
    );
};

export default TestConstructor;
