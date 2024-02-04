import { Component, ViewChild, OnInit, ElementRef, Inject, PLATFORM_ID, NgModule } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';

declare var MediaRecorder: any;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'ai';
  videoElement: HTMLVideoElement;
  recordVideoElement: HTMLVideoElement;
  mediaRecorder: any;
  videoRecordedBlobs: Blob[];
  isRecording: boolean = false;
  downlaodVideoUrl: string;
  stream: MediaStream;
  @ViewChild('videoElement') videoElementRef: ElementRef;
  @ViewChild('recordVideoElement') recordVideoElementRef: ElementRef;
  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      navigator.mediaDevices.getUserMedia({
        video: {
          width: 1280,
          height: 720
        }
        }).then(stream => {
          this.videoElement = this.videoElementRef.nativeElement;
          this.recordVideoElement = this.recordVideoElementRef.nativeElement;
          this.stream = stream;
          this.videoElement.srcObject = this.stream;
        });
    }
  }

  startVideoRecording() {
    this.videoRecordedBlobs = [];
    let options: any = {
      mimeType: 'video/webm;codecs=vp9'
    };
    try {
      this.mediaRecorder = new MediaRecorder(this.stream, options);
    } catch (err) {
      console.log(err);
    }
    this.mediaRecorder.start();
    this.isRecording = !this.isRecording;
    this.onDataAvailableVideoEvent();
    this.onStopVideoRecordingEvent();
    }

    stopVideoRecording() {
      this.mediaRecorder.stop();
      this.isRecording = !this.isRecording;
    }

    playRecording() {
      if (!this.videoRecordedBlobs || !this.videoRecordedBlobs.length) {
        return;
      }
      this.recordVideoElement.play();
    }

    onDataAvailableVideoEvent() {
      try {
        this.mediaRecorder.ondataavailable = (event: any) => {
          if (event.data && event.data.size > 0) {
            this.videoRecordedBlobs.push(event.data);
          }
        };
      } catch (error) {
        console.log(error);
      }
    }
    onStopVideoRecordingEvent() {
      try {
        this.mediaRecorder.onstop = (event: Event) => {
          const videoBuffer = new Blob(this.videoRecordedBlobs, {
            type: 'video/webm'
          });
          this.downlaodVideoUrl = URL.createObjectURL(videoBuffer);
          this.recordVideoElement.src = this.downlaodVideoUrl;
        };
      } catch (error) {
        console.log(error);
      }
    }
}
