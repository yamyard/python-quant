import uvicorn

if __name__ == "__main__":
    uvicorn.run("api.core:app", host="localhost", port=8080, reload=True)
