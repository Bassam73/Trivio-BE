import mongoose from "mongoose";

export interface IMessage {
  _id?: string;
  threadId: string; 
  senderType: "human" | "ai";
  text: string;
  isEdited: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface createMessageDTO {
  threadId: string;
  senderType: "human" | "ai";
  text: string;
}

export interface updateMessageDTO {
  mid: string; 
  text: string;
}