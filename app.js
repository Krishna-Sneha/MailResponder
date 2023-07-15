const express = require("express");
const app = express();
const port = 5000;
const path = require("path");
const { authenticate } = require("@google-cloud/local-auth");
const { google } = require("googleapis");

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.labels",
  "https://mail.google.com/",
];

app.get("/", async (req, res) => {
  const auth = await authenticate({
    keyfilePath: path.join(__dirname, "client_credentials.json"),
    scopes: SCOPES,
  });

  console.log(`AUTH tokens: ${auth.credentials}`);

  const gmail = google.gmail({ version: "v1", auth });

  const response = await gmail.users.labels.list({
    userId: "me",
  });
  console.log(`gmail labels: ${response}`);

  const labelName = "vacation";

  async function GetUnrepliedMessages(auth) {
    const res = await gmail.users.messages.list({
      userId: "me",
      q: "-in:chats -from:me -has:userlabels",
    });
    console.log(`res.data.messages: ${res.data.messages}`);
    return res.data.messages || [];
  }

  async function SendReply(auth, message) {
    const res = await gmail.users.messages.get({
      userId: "me",
      id: message.id,
      format: "metadata",
      metadataHeaders: ["Subject", "From"],
    });

    console.log(`res of sendReply: ${res}`);

    const subject = res.data.payload.headers.find(
      (header) => header.name === "Subject"
    ).value;

    const from = res.data.payload.headers.find(
      (header) => header.name === "From"
    ).value;

    const replyTo = from.match(/<(.*)>/)[1];
    const replySubject = subject.startsWith("Re:") ? subject : `Re: ${subject}`;
    const replyBody = `Hey,\n\nI'm currently on vacation, will get back to you soon.\n\nRegards,\nKrishna Sneha`;
    const rawMsg = [
      `From: me`,
      `To: ${replyTo}`,
      `Subject: ${replySubject}`,
      `In-Reply-To: ${message.id}`,
      `References: ${message.id}`,
      ``,
      replyBody,
    ].join(`\n`);

    const encodedMsg = Buffer.from(rawMsg)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMsg,
      },
    });
  }

  async function CreateLabel(auth) {
    const gmail = google.gmail({ version: "v1", auth });
    try {
      const res = await gmail.users.labels.create({
        userId: "me",
        requestBody: {
          name: labelName,
          labelListVisibility: "labelShow",
          messageListVisibility: "show",
        },
      });
      return res.data.id;
    } catch (err) {
      if (err.code === 409) {
        console.log("entered here in err409");
        const res = await gmail.users.labels.create({
          userId: "me",
        });
        const label = res.data.labels.find((label) => label.name === labelName);
        return label.id;
      } else {
        throw err;
      }
    }
  }

  async function AddLabel(auth, message, labelId) {
    const gmail = google.gmail({ version: "v1", auth });
    await gmail.users.messages.modify({
      userId: "me",
      id: message.id,
      requestBody: {
        addLabelIds: [labelId],
        removeLabelIds: ["INBOX"],
      },
    });
  }

  async function Main() {
    const labelId = await CreateLabel(auth);
    console.log(`Created or found label with id: ${labelId}`);

    setInterval(async () => {
      const msgs = await GetUnrepliedMessages(auth);
      console.log(`Found ${msgs.length} unreplied messages`);

      for (const msg of msgs) {
        await SendReply(auth, msg);
        console.log(`Sent reply to msg with id ${msg.id}`);

        await AddLabel(auth, msg, labelId);
        console.log(`Added label to the msg with id ${msg.id}`);
      }
    }, Math.floor(Math.random() * (120 - 45 + 1) + 45) * 1000);
  }

  Main().catch(console.error);

  const labels = response.data.labels;
  res.send("You have successfully subscribed for the services!");
});

app.listen(port, () => {
  console.log(`app is listening at http://localhost:${port}`);
});
