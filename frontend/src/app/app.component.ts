import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ResultsResponse, Result } from './results.response';
import { SearchResponse } from './search.response';
import { Subscription, interval, pipe, timer } from 'rxjs';
import { take } from 'rxjs/operators';
import swal from "sweetalert2";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    data = [];
    searchSub: Subscription;
    intervalSub: Subscription;
    searchResultsReceived = false;
    showLoadingSpinner = false;
    query = "";
    backend_url = "https://backendpipeline.eu-gb.mybluemix.net/search"

    constructor(private httpClient: HttpClient) { }

    ngOnDestroy() {
        this.searchSub.unsubscribe();
        this.intervalSub.unsubscribe();
    }

    // send search term to backend
    search() {
        if (this.query == "") {
            // break and alert if query is empty
            swal.fire({
                showCancelButton: false,
                title: "Fehler",
                text: "Sorry, das Suchfeld darf nicht leer sein!",
                customClass: {
                    confirmButton: "sw-confirm-btn-class"
                },
                confirmButtonText: "Okay"
            });
        } else {
            console.log("Starte Suche mit: ", this.query);
            if (this.intervalSub != undefined) {
                this.intervalSub.unsubscribe();
            }
            // reset local data for new search results
            this.data = [];
            this.searchResultsReceived = false;
            this.showLoadingSpinner = true;

            // http call to backend
            this.searchSub = this.httpClient.post(this.backend_url,
                {
                    query: this.query
                })
                .subscribe(async (res: SearchResponse) => {
                    console.log("Search Results: ", res);
                    if (res.results.length > 0) {
                        this.searchResultsReceived = true;
                        this.showLoadingSpinner = false;
                        this.appendToData(res.results);
                    }
                    if (res.pendingUrls.length > 0) {
                        this.intervalSub = timer(10000, 10000).subscribe(() => {
                            console.log("getResults aufgerufen");
                            this.httpClient.post(this.backend_url, { query: this.query })
                                .subscribe(async (res: ResultsResponse) => {
                                    console.log("res von pending urls: ", res);
                                    this.searchResultsReceived = true;
                                    this.showLoadingSpinner = false;
                                    this.appendToData(res.results);

                                    if (res.pendingUrls.length == 0 && res.results.length != 0) {
                                        this.intervalSub.unsubscribe();
                                        this.searchSub.unsubscribe();
                                    }
                                });
                        });
                    }
                    else {
                        this.intervalSub.unsubscribe();
                        this.searchSub.unsubscribe();

                    }
                });
        }
    }

    // append incoming results from pending urls to already received results
    appendToData(results: Result[]) {
        console.log('results', results);

        for (var i = 0; i < results.length; i++) {
            var joinedContent = "";
            for (var j = 0; j < results[i].content.data.length; j++) {
                if (results[i].content.data[j].html.indexOf("<p>") > 0) {
                    joinedContent += results[i].content.data[j].html;
                }
            }
            if (joinedContent.indexOf("<p>") > 0) {
                var item = {
                    url: results[i].url,
                    title: results[i].name,
                    score: results[i].content.matching.rate,
                    responseTime: results[i].executionTime[results[i].executionTime.length - 1][1] - results[i].executionTime[0][0],
                    summary: joinedContent
                };
                //console.log('item', item);
                if (!this.data.includes(item.url)) {
                    if (item.score > 0 && item.score != undefined) {
                        this.data.push(item);
                        this.data.sort(function (a, b) {
                            return b.score - a.score;
                        });
                    }
                }
            }
        }
    }

}