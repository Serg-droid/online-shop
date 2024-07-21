import { useState, useContext } from "react";
import axios from "axios"

import { StateContext } from "../main";


export function UploadFile({ companion_id }) {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { authState } = useContext(StateContext);
  
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
    const res = await axios.post(
      `${import.meta.env.VITE_MASTER_SERVER_DOMAIN}chat/send_message/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Token ${authState.token}`
        },
        onUploadProgress: function(progressEvent) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      }
    );
    console.log(res)
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
