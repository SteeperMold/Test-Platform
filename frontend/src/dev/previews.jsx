import React from 'react'
import {ComponentPreview, Previews} from '@react-buddy/ide-toolbox'
import {PaletteTree} from './palette'
import DiplomaEditor from "../components/DiplomaEditor";

const ComponentPreviews = () => {
    return (
        <Previews palette={<PaletteTree/>}>
            <ComponentPreview path="/DiplomaEditor">
                <DiplomaEditor/>
            </ComponentPreview>
        </Previews>
    )
}

export default ComponentPreviews