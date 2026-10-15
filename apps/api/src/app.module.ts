import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { RenderingController } from './rendering/rendering.controller';
import { RenderingService } from './rendering/rendering.service';

@Module({ controllers: [AppController, RenderingController], providers: [RenderingService] })
export class AppModule {}
