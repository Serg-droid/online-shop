import { useState, useContext } from "react";

import { StateContext } from "../state";


export function UploadFile({ companion_id }) {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { authState, chatState } = useContext(StateContext);
  
  const onInputChange = (e) => {
    setFile(e.target.files[0])
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData()
    formData.append("file", file)
    formData.append("data", JSON.stringify({
      companion_id
    }))
    chatState.sendMessageWithImage({ 
      formData, 
      token: authState.token,
      onUploadProgress: function(progressEvent) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      }
    })
  };

  return (
    <form
      action=""
      method="post"
      encType="multipart/form-data"
      onSubmit={onSubmit}
    >
      <label htmlFor="file">File</label>
      <input id="file" name="file" type="file" onChange={onInputChange} />
      <button>Upload</button>

      <progress value={uploadProgress} max="100"></progress>
    </form>
  );
}
