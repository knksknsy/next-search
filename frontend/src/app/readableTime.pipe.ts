import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'readableTime'})
export class ReadableTime implements PipeTransform {

  transform(time: number): string {
    console.log("time:", time);
    time = time / 1000;
    time = parseFloat(time.toFixed(1));
    if(time >= 60) {
      var minutes = Math.floor(time / 60);
      var seconds = time - minutes * 60;
      return minutes + " min " + seconds + " sec";
    } else {
      if(time == undefined || time == null || time == 0) {
        return "ERR";
      } else {
        return time + " sec";
      }
    }
  }

}