# gemini-chat
nodejs program to send and receive messages, and get message history

Install the libraries by entering the following command in the keyboard:
```
npm install @google/generative-ai socket.io express
```
Run the program by typing:
```
node index.js
```
Open the program by navigating to the following address in any browser:
```
http://localhost:3000/
``` 
if necessary change the system prompt at file systemi.txt
you can check if default systemInstruction is working or not by asking:
```
what is your name?
where do you live?
``` 
if you want to see returned candidates  on console, unmark following line:
```
		// console.log(util.inspect(response.candidates, {showHidden: false, depth: null, colors: true}))
```

to reset the chat, refresh page.

do not forget to set randomness (temperature) between 0.0 to 1.0 according to your needs here:
```
const generationConfig = {
      temperature: 0.9,
    };
```
to be able to use this api, you need to get an api from https://makersuite.google.com/app/apikey, and set as environment variable named GEMINI_API_KEY
