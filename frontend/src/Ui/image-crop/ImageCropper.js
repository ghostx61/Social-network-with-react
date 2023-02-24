import React, { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import LoadingSpinner from '../LoadingSpinner';

// import ImgDialog from './ImgDialog'
import getCroppedImg from './cropImage'
import './ImageCropper.css';




const ImageCropper = (props) => {
    let newImage = 'https://img.huffingtonpost.com/asset/5ab4d4ac2000007d06eb2c56.jpeg?cache=sih0jwle4e&ops=1910_1000';
    newImage = props.image;
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [rotation, setRotation] = useState(0)
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
    const [croppedImage, setCroppedImage] = useState(null)

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const saveCroppedImage = useCallback(async () => {
        try {
            const croppedImage = await getCroppedImg(
                newImage,
                croppedAreaPixels,
                rotation
            )
            console.log('donee', { croppedImage })
            setCroppedImage(croppedImage);
            props.update(croppedImage);
        } catch (e) {
            console.error(e)
        }
    }, [croppedAreaPixels, rotation])

    const onClose = useCallback(() => {
        setCroppedImage(null)
    }, [])

    const zoomHandler = (e) => {
        console.log('zoom' + e.target.value);
        setZoom(e.target.value);
    }

    return (
        <div>
            <div className="cropContainer">
                <Cropper
                    image={newImage}
                    crop={crop}
                    rotation={rotation}
                    zoom={zoom}
                    aspect={1}
                    showGrid={false}
                    onCropChange={setCrop}
                    onRotationChange={setRotation}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                    cropShape='round'
                />

            </div>
            <input type="range" id="cropRange" onChange={zoomHandler} value={zoom} min='1' max='2' step='0.01' />
            <p>Zoom</p>
            {props.loading && <LoadingSpinner />}
            {!props.loading && <button className="btn btn-primary" onClick={saveCroppedImage}>Update profile</button>}
            {!props.loading && <button className='btn btn-secondary' style={{ marginLeft: '10px' }} onClick={props.close}>Close</button>}
            {/* <div className={classes.controls}>
                <div className={classes.sliderContainer}>
                    <Typography
                        variant="overline"
                        classes={{ root: classes.sliderLabel }}
                    >
                        Zoom
                    </Typography>
                    <Slider
                        value={zoom}
                        min={1}
                        max={3}
                        step={0.1}
                        aria-labelledby="Zoom"
                        classes={{ root: classes.slider }}
                        onChange={(e, zoom) => setZoom(zoom)}
                    />
                </div>
                <div className={classes.sliderContainer}>
                    <Typography
                        variant="overline"
                        classes={{ root: classes.sliderLabel }}
                    >
                        Rotation
                </Typography>
                    <Slider
                        value={rotation}
                        min={0}
                        max={360}
                        step={1}
                        aria-labelledby="Rotation"
                        classes={{ root: classes.slider }}
                        onChange={(e, rotation) => setRotation(rotation)}
                    />
                </div> */}
            {/* <Button
                    onClick={saveCroppedImage}
                    variant="contained"
                    color="primary"
                    classes={{ root: classes.cropButton }}
                >
                    Show Result
                </Button> */}
            {/* </div>
            <ImgDialog img={croppedImage} onClose={onClose} /> */}
        </div>
    )
}

export default ImageCropper;
