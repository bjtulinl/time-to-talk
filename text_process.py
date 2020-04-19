import urllib.request, urllib.error,urllib.parse
import json


def sentiment_analysis(text):
    APPLICATION_ID = 'ceb14481'
    APPLICATION_KEY = 'c282071cd4dec2e9d2ecba28ed0e6cd7'
    def call_api(endpoint, parameters):
        url = 'https://api.aylien.com/api/v1/' + endpoint
        headers = {
            "Accept": "application/json",
            "Content-type": "application/x-www-form-urlencoded",
            "X-AYLIEN-TextAPI-Application-ID": APPLICATION_ID,
            "X-AYLIEN-TextAPI-Application-Key": APPLICATION_KEY
        }

        opener = urllib.request.build_opener()
        request = urllib.request.Request(url,urllib.parse.urlencode(parameters).encode('utf-8'), headers)
        response = opener.open(request)
        return json.loads(response.read().decode())

    parameters = {"text": text}
    sentiment = call_api("sentiment",parameters)
    return sentiment['polarity']
