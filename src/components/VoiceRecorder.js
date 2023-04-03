import React, { useState } from "react";
import axios from "axios";

let mediaRecorder;
const chunks = [];

const VoiceRecorder = () => {
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [error, setError] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [stream, setStream] = useState(null);
  const [transcript, setTranscript] = useState("");

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    setStream(stream);

    // mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/mp3' });
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.addEventListener("dataavailable", (event) => {
      chunks.push(event.data);
    });

    mediaRecorder.addEventListener("stop", () => {
      const audioBlob = new Blob(chunks, { type: "audio/webm" });
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioURL(audioUrl);
      setAudioFile(audioBlob);
    });

    mediaRecorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    if (stream.getAudioTracks) {
      const tracks = stream.getAudioTracks();
      tracks.forEach((track) => {
        track.stop();
      });
    } else {
      console.log("No Tracks Found");
    }
    mediaRecorder.stop();
    setRecording(false);
  };

  const uploadRecording = async () => {
    const blobFile = new File([audioFile], "recorded_audio");
    const formData = new FormData();
    formData.append("name", "John");
    formData.append("email", "john@gmail.com");
    formData.append("audio", blobFile);

    setUploading(true);

    try {
      const { data } = await axios.post(
        "https://eventnub.onrender.com/api/music-unison/transcribe-audio",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setTranscript(data.transcript);
      console.log({ data });
    } catch (error) {
      const msg = error.request
        ? error.request.responseText
        : error.response.responseText;
      setError(msg);
    }

    setUploading(false);
  };

  const resetPage = () => {
    window.location.reload();
  };

  return (
    <div style={{ padding: "1.2em" }}>
      <p>
        <b>Transcription Feature Test for Music Unison (Demo)</b>
      </p>
      <p>
        For a better transcription process, please take note of the following:
      </p>
      <ol>
        <li>Ensure that your environment is free of noise</li>
        <li>Be loud and clear</li>
        <li>
          Click <b>upload</b> button to send to server and get transcription
        </li>
        <li>
          Click <b>reset</b> button before any new recording
        </li>
        <li>
          You can try different recordings (normal speech, singing a song etc.)
        </li>
      </ol>
      {audioURL && (
        <audio controls>
          <source src={audioURL} type="audio/ogg" />
          <source src={audioURL} type="audio/mpeg" />
          <track src="dav.vtt" kind="captions" label="English" />
        </audio>
      )}
      {error && <p style={{ fontSize: "10pt", color: "#8a1010" }}>{error}</p>}

      <div style={{ marginTop: "1.2em" }}>
        <button onClick={startRecording} disabled={recording}>
          Start Recording
        </button>
        <button onClick={stopRecording} disabled={!recording}>
          Stop Recording
        </button>
      </div>
      <div style={{ marginBottom: "1.2em", marginTop: "1.2em" }}>
        <button onClick={uploadRecording} disabled={uploading}>
          {uploading ? "Uploading" : "Upload"}
        </button>
        <button onClick={resetPage}>Reset</button>
      </div>

      {transcript ? (
        <p>
          Result: <b>{transcript}</b>
        </p>
      ) : (
        <p>No result</p>
      )}
    </div>
  );
};

export default VoiceRecorder;
