/*

Do you use Google Mail? Do you use Evernote?  You can use this script to integrate the two, and use Evernote
as your centralized to-do list.  

I practice a zero-inbox policy.  When an email comes in, I either 

a) immediately reply to it
b) delete it
c) send it to Evernote

Simply star an email, and the script will send it to Evernote.  You can even archive the email if you want,
the script doesn't care, it sends it no matter what.  Once the message shows up in Evernote, you can add 
tags to the item to help you organize yourself.

--Credits--

I was inspired to write this script after watching the series of videos at

http://www.thesecretweapon.org/

which talks about using Evernote alongside your email client to help you "Getting Things Done" (GTD is a phrase
coined by David Allen).

To implement the Secret Weapon, I needed a simple way to move incoming emails into my Evernote, without 
having to:

a) do a lot of copy/pasting
b) forward emails (clumsy)

I came across a Google Script by Harry Oosterveen 

http://www.harryonline.net/evernote/send-google-mail-to-evernote

Harry's solution uses labels.  You label an email with certain labels and his script automagically sends it to
Evernote and even places it in the correct notebook.

--Functionality--

The only problem with Harry's solution is how Google Mail handles labels.  It is done on a thread-level basis,
not on an email-level basis.  So his script only catches the most recent message in a thread.  There is no way
to grab just a single email from a long thread, and send it to Evernote.  As well, emails are collected by 
threads (according to the subject line), and the thread is labeled, but emails added to the thread *after* 
the label has been applied do not show up in a search of that label.  You need to re-apply the label every time!

So I decided to use stars.  Stars are a message-level marker.  The nice thing is, you can add stars to emails
on any device, and the server-side script handles things behind the scenes.

1.  Star an email in Google Mail (web or mobile application)
2.  Script checks your mail, searches for starred messages, and saves them to Evernote.
3.  Script automatically un-stars the messages when it is completed.

--Installation--

It runs as a script in your Google Drive. To install:

1.  Go to your Google Drive
2.  Click Create>More>Script and create a new blank project.
3.  Delete the boilerplate code that Google pasted into the editing area.
4.  Paste all of this code into the editing area
5.  Give the script a name: change "Untitled project" to something else more memorable.
6.  Click File>Project properties and click on 'User properties' tab.
7.  Define some Properties:

        Property: evernoteMail           Value: <your Evernote email address>
        Property: defaultNotebook_mail   Value: <the Evernote notebook you want to save article into>
 
8.  Configure how often it runs. Click Resources>'All your triggers', then 'Add a new trigger', and configure 
    to run as often as you want.
    
--Notes--

a) The Evernote email address referenced in (7) is the secret one you use to send content to Evernote via email,
   not the email address associated with your account. You can get your Evernote email address from 
   Tools>Account Info in the PC application, or from the 'Settings' pulldown menu on the web site. 

b) If you are using Google two-step authentication, you will need to generate an application-specific password. 
   In Gmail, click on 'Gear icon'>Settings and select 'Accounts' tab, then click 'Google Account settings', 
   then 'Security', then 'Manage access' under 'Connected applications and sites'. Give the password a label, 
   and click 'Generate password'.  Use this password.

--For more information on the Google Scripting--

https://developers.google.com/apps-script/

*/


function MailtoEvernote() {
  var evernoteMail = UserProperties.getProperty('evernoteMail');
  var defaultNotebook = UserProperties.getProperty('defaultNotebook_mail');
  // get all threads that contain starred messages
  var starred_threads=GmailApp.getStarredThreads();
  for(var i=0;i < starred_threads.length;i++) {
    // for each thread, get the messages in that thread
    var messages=starred_threads[i].getMessages();
    // for each thread, check which message(s) are starred
    for (var j=0;j < messages.length;j++) {
      // if message is starred, process tags and send to Evernote
      if (messages[j].isStarred()){
       
        // Parse notebook name
        if(defaultNotebook != undefined && defaultNotebook != '') {
          var notebook=' @' + defaultNotebook;
        } else {
          var notebook=' @' + 'Actions Pending';
        }
                
        message_body="Date: "+messages[j].getDate()+"<br>Message ID: "+messages[j].getId()+"<Br>To: "+messages[j].getTo()+"<br>From: "
          +messages[j].getFrom()+"<br>Cc: "+messages[j].getCc()+"<br>Bcc: "+messages[j].getBcc()+"<br><br>"+messages[j].getBody();
        GmailApp.sendEmail(evernoteMail, messages[j].getSubject()+notebook, '', {noReply:true, htmlBody: message_body});
        messages[j].unstar();   

      }
    }
  }
}
