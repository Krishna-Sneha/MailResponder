Vacation Mail Responder:

The Vacation Mail Responder is a simple email autoresponder that automatically replies to incoming emails while you are on vacation. It allows you to inform senders that you are currently away and provides them with alternative contacts or important information.

Features: 
1. Automatic email responses: When enabled, the Vacation Mail Responder automatically sends a reply to incoming emails, notifying the sender that you are currently on vacation.
2. Customizable message: You can customize the vacation message to include relevant details such as the duration of your absence, alternative contact information, or any other important instructions.
3. Whitelist: Optionally, you can configure a whitelist of email addresses that will not receive an autoresponse. This can be useful for excluding important contacts or specific domains from receiving automated replies.
4. Easy setup: The Vacation Mail Responder is easy to set up and configure, requiring only minimal configuration parameters such as vacation message content and whitelist settings.
5. Enable/disable: You can easily enable or disable the Vacation Mail Responder at any time, allowing you to control when the autoresponder is active.

Implementation: 

1. Used the Gmail API from Google Cloud, then performed the auth consent and downloaded the client_credentials.json file.
2. Then main used npm packages: Express, path, googleapis, google cloud local auth.
3. Then went through and defined the scopes required.
4. Generate the auth token using google cloud local auth.
5. Created functions for getting non-replied mails, sending replies, encoding message, creating labels, and adding label to the mails recieved.


Here is the walkthrough of code implementation and app testing.
GoogleDrive Link:
https://drive.google.com/file/d/1hA8EmnGLyHhTlnacf7z0-4UlYrW_izQu/view?usp=sharing

For any inquiries or questions, please contact snehaaes@gmail.com

