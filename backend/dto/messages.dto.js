export class CreateMessageDTO {
  constructor({ chatId, model, content }) {
    this.chatId = chatId;
    this.model = model;
    this.content = content;
  }
}
