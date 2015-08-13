#!/usr/bin/env python

import os
import re
import json
import time
import urllib
import logging
import urlparse

from os.path import join, dirname, abspath, walk

SLEEP = 2 # seconds to sleep between requests

DATA_DIR = join(dirname(dirname(abspath(__file__))), 'data')


def get_json(json_dir):
    for dirpath, dirnames, filenames in os.walk(json_dir):
        for filename in filenames:
            if filename.endswith('.json'):
                path = join(dirpath, filename)
                yield path, json.load(open(path))

def artists():
    return get_json(join(DATA_DIR, 'artists'))

def objects():
    return get_json(join(DATA_DIR, 'objects'))

def get_image_url(url):
    if not url:
        return None

    try:
        resp = urllib.urlopen(url)
    except IOError:
        print "caught IOError, retrying"
        time.sleep(1)
        return get_image_url(url)

    if resp.getcode() != 200:
        logging.error("%s returned HTTP %s", url, resp.getcode())
        return None

    html = resp.read()
    m = re.search(r' srcset="(.+?)"', html)
    if not m:
        return None

    images = m.group(1).split(", ")
    img_url, width = images[-1].split(" ")

    return urlparse.urljoin(url, img_url)

def main():
    logging.basicConfig(level=logging.INFO)
    for path, obj in objects():
        if "ImageURL" in obj:
            logging.info("%s already has ImageURL", path)
            continue
        time.sleep(SLEEP)
        url = obj["URL"]
        img_url = get_image_url(url)
        obj["ImageURL"] = img_url
        open(path, 'w').write(json.dumps(obj, indent=2))
        if img_url:
            logging.info("found image %s for %s", img_url, path)
        else:
            logging.info("no image found for %s", obj["ObjectID"])

if __name__ == "__main__":
    main()
