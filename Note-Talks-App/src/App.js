import React, { useState } from 'react';
import { Configuration, OpenAIApi } from "openai";
import './index.css';
import './App.css';

function RestartIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24">
      <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" fill='#A7B1D1'/>
      <path d="M0 0h24v24H0z" fill="none"/>
    </svg>
  );
}


function App() {

  const API_URL = "https://us-central1-texttospeech.googleapis.com/v1beta1/text:synthesize";

  async function synthesizeText(text) {
    const apiKey = '';
    const requestBody = {
        "audioConfig": {
          "audioEncoding": "LINEAR16",
          "pitch": 0,
          "speakingRate": 1
        },
        "input": {
          "ssml": text
        },
        "voice": {
          "languageCode": "en-US",
          "name": "en-US-Neural2-I"
        }
    };
  
    const response = await fetch('https://texttospeech.googleapis.com/v1beta1/text:synthesize', {
      method: 'POST',
      headers: {
        'X-Goog-Api-Key': apiKey,
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(requestBody)
    });
  
    if (!response.ok) {
      throw new Error("Failed to synthesize speech");
    }
  
    const data = await response.json();
    console.log(data)
    return data.audioContent;
  }

  const configuration = new Configuration({
    organization: "",
    apiKey: "",
  });
  
  const openai = new OpenAIApi(configuration);
  

  const options = {
    "model": "text-davinci-003",
    "max_tokens": 3000,
    "temperature": 0.6,
    "top_p": 1,
    "n": 1,
    "stream": false,
    "logprobs": null,
    "stop": ""
  }

  const [notes, setNotes] = useState('');
  const [showMore, setShowMore] = useState(false);

  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [audioPlayer, setAudioPlayer] = useState(null);

  const toggleShowMore = () => setShowMore(!showMore);

  const submitPrompt = async () =>{
    setLoading(true)
    let request = { ...options, prompt:'Create an engaging and funny 1 person podcast script discussing the following study notes, include a few quiz questions related to the topic discussed for the viewers at the end, and format the script in ssml: "'+notes+"'"}
    const response = await openai.createCompletion(request);
    console.log(response.data.choices[0].text)
    const audioContent = await synthesizeText(response.data.choices[0].text)
    
    setAudioPlayer(<audio className='audio-controls' src={`data:audio/wav;base64,${audioContent}`} controls />)
    setGenerating(true)
    setLoading(false)
  }

  function clearNotes (){
    const textBox = document.querySelector('textarea[type="text"]');
    textBox.value = '';
  }

  return (
    <div className='main-app'>
      <h1 className='main-title'>Note Talks</h1>
      <h2 className='sub-title'>Turn your study notes into an enjoyable podcast 🎙️</h2>
      <ol>
        <i><p className='description'> Paste your study notes or reading material into the text field.</p></i>
        {showMore && <i><p className='description'> Customize the style of your podcast by selecting the appropriate options. For example, choose the "questionnaire" option to include questions in the podcast conversation.</p></i>}
        {showMore && <i><p className='description'> Click the "submit" button & enjoy your podcast..</p></i>}
        <button onClick={toggleShowMore} className='description-toggle'>
        {showMore ? 'Show Less' : 'Show More'}
      </button>
      </ol>
      <textarea rows="20" cols="50" 
                className='notes-text-field'
                type="text"
                name="notes"
                placeholder="Paste your study notes here."
                value={notes}
                onChange={event => setNotes(event.target.value)}/>
      <div className='text-field-buttons'>
        <button className='submit-button' id={loading? 'loading' : 'done'}type="submit" onClick={submitPrompt}>{loading? 'Loading...' : 'Submit'}</button>;
        <button className='clear-button' onClick={clearNotes}><RestartIcon className='clear-icon'/></button>;
      </div>
      {generating? 
      <div className='generated-section'>
        {audioPlayer}
      </div>: <></>}
      
    </div>
  );
}

export default App;
