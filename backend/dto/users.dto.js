export class UserResponseDTO {
  constructor(user) {
    this.email = user.email;
    this.name = user.name;
    this.image = user.image;
  }
}
