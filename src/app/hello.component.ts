import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Component, ElementRef, Input, ViewChild } from "@angular/core";

@Component({
  selector: "hello",
  template: `
    <h1>Hello {{ name }}!</h1>
    <video #videoElement controls></video>
  `,
  styles: [
    `
      h1 {
        font-family: Lato;
      }
    `
  ]
})
export class HelloComponent {
  @Input() name: string;

  constructor(private http: HttpClient) { }

  assetURL = "assets/frag_bunny.mp4";

  // Modify this with the actual mime type and codec
  mimeCodec = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"';

  @ViewChild("videoElement") video: ElementRef;

  ngAfterViewInit() {
    if (
      "MediaSource" in window &&
      MediaSource.isTypeSupported(this.mimeCodec)
    ) {
      const mediaSource = new MediaSource();
      (this.video.nativeElement as HTMLVideoElement).src = URL.createObjectURL(
        mediaSource
      );
      mediaSource.addEventListener("sourceopen", () =>
        this.sourceOpen(mediaSource)
      );
    } else {
      console.error("Unsupported MIME type or codec: ", this.mimeCodec);
    }
  }

  sourceOpen(mediaSource) {
    const sourceBuffer = mediaSource.addSourceBuffer(this.mimeCodec);
    const token = "some token"; // Load the token from some service
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http
      .get(this.assetURL, { headers, responseType: "blob" })
      .subscribe(blob => {
        sourceBuffer.addEventListener("updateend", () => {
          mediaSource.endOfStream();
          this.video.nativeElement.play();
        });
        blob.arrayBuffer().then(x => sourceBuffer.appendBuffer(x));
      });
  }
}
