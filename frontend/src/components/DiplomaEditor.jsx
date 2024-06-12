import React, {useCallback} from "react";
import axios from "axios";
import Cookies from "js-cookie";
import {baseURL} from '../App'
import {EditorState, Modifier} from 'draft-js';
import {Editor} from 'react-draft-wysiwyg';
import Select from 'react-select';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import '../static/css/diploma_editor.css';
import NoZoomPopup from "./NoZoomPopup";
import {getDocument} from 'pdfjs-dist/webpack';

const ContextValuesSelector = ({pasteText}) => {
    const options = [
        {value: '{{percentage}}%', label: 'Процент правильных ответов'},
        {value: '{{correct_answers_num}}', label: 'Кол-во правильных ответов'},
        {value: '{{incorrect_answers_num}}', label: 'Кол-во неправильных ответов'},
        {value: '{{user_name}}', label: 'Имя, оставленное пользователем'},
        {value: '{{user_surname}}', label: 'Фамилия, оставленная пользователем'},
        {
            value: '{{user_school_name}}',
            label: 'Название образовательного учреждения, оставленное пользователем',
        },
        {
            value: '{{correct_answers_text}}',
            label: 'Кол-во правильных ответов + "правильных ответов" в правильном склонении',
        },
        {
            value: '{{incorrect_answers_text}}',
            label: 'Кол-во неправильных ответов + "неправильных ответов" в правильном склонении',
        },
    ];

    return <Select options={options} className="block-type-selector" placeholder="Контекстные значения..."
                   onChange={selectedOption => pasteText(selectedOption.value)}/>;
};

const AddBackgroundImageButton = ({setBackgroundImage}) => {
    const setBackgroundFromImage = useCallback(file => {
        const formData = new FormData();
        formData.append('image', file);

        axios.put(`${baseURL}/api/put_image/`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                "X-CSRFToken": Cookies.get("csrftoken"),
            }
        })
            .catch(error => console.error(error))
            .then(response => {
                const imageURL = response.data.image_url;
                setBackgroundImage(imageURL);
                document.querySelector('.rdw-editor-main').style.background = `url(${imageURL}) center center / contain no-repeat`;
            });
    }, []);

    const setBackgroundFromPdf = useCallback(file => {
        const reader = new FileReader();

        reader.onload = async () => {
            const pdf = await getDocument(reader.result).promise;
            const page = await pdf.getPage(1);

            const viewport = page.getViewport({scale: 2});
            const canvas = document.createElement('canvas');
            const canvasContext = canvas.getContext('2d');
            canvas.height = viewport.height || viewport.viewBox[3];
            canvas.width = viewport.width || viewport.viewBox[2];

            page.render({canvasContext, viewport}).promise.then(res => canvas.toBlob(blob => {
                const file = new File([blob], 'image.png', {type: 'image/jpeg'});
                setBackgroundFromImage(file);
            }));
        };
        reader.readAsDataURL(file);
    }, []);

    const insertBackgroundImage = (event) => {
        const file = event.target.files[0];

        if (file.type === "application/pdf") {
            setBackgroundFromPdf(file);
        } else {
            setBackgroundFromImage(file);
        }
    };

    return <input type="file" accept="application/pdf,image/jpeg,image/png,image/svg"
                  onChange={insertBackgroundImage}/>;
};


const DiplomaEditor = ({editorState, setEditorState, setBackgroundImageURL}) => {
    const pasteText = (text) => {
        setEditorState(EditorState.push(editorState, Modifier.insertText(
            editorState.getCurrentContent(),
            editorState.getSelection(),
            text), 'insert-characters'
        ));
    };

    const toolbarOptions = {
        options: ['history', 'inline', 'blockType', 'fontSize', 'fontFamily', 'list', 'textAlign', 'colorPicker', 'link', 'emoji', 'image'],
        image: {
            uploadEnabled: true,
            previewImage: true,
            uploadCallback: (image) => new Promise((resolve, reject) => {
                const formData = new FormData();
                formData.append("image", image);

                axios.put(`${baseURL}/api/put_image/`, formData, {headers: {"Content-Type": "multipart/form-data"}})
                    .then(response => resolve({data: {link: response.data.image_url}}))
                    .catch(error => reject(error));
            }),
        },
    };

    return (
        <>
            <NoZoomPopup/>
            <Editor
                editorState={editorState}
                onEditorStateChange={setEditorState}
                toolbar={toolbarOptions}
                toolbarCustomButtons={[<ContextValuesSelector pasteText={pasteText}/>,
                    <AddBackgroundImageButton setBackgroundImage={setBackgroundImageURL}/>]}
                localization={{locale: 'ru'}}
            />
        </>
    );
};

export default DiplomaEditor;
