import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const [box, setBox] = useState<{ [k: string]: any }[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const getCurrentPosition = () =>
    new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      });
    });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    let lat: number | undefined;
    let lng: number | undefined;

    try {
      // Try to get coords (no API key needed)
      const pos = await getCurrentPosition();
      lat = pos.coords.latitude;
      lng = pos.coords.longitude;

      console.log(lat);
    } catch (geoErr) {
      console.warn(
        "Geolocation failed or denied, continuing without coords:",
        geoErr
      );
      // optional: show a toast to user
    }

    try {
      const res = await fetch("http://localhost:3008/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: inputValue, lat, lng }),
      });

      const json = await res.json();

      const inputedData = {
        question: inputValue,
        linkItem: json?.data,
      };

      setBox((prev) => [...prev, inputedData]);
      setInputValue("");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [box, loading]); // scroll tiap ada pesan baru atau loading berubah

  return (
    <div className="chat-container">
      <div className="chat-box">
        {/* {JSON.stringify(box)} */}
        {box.map((item, index) => (
          <div key={index}>
            <div className="question-box">
              <div style={{ flex: 0.2 }}></div>
              <div className="question-box-item">{item.question}</div>
            </div>
            <div className="answer-box">
              <div className="answer-box-item">
                {item.linkItem.map((itemData: any, indexLink: any) => (
                  <div key={indexLink}>
                    <div>Destination :{itemData.name}</div>
                    <div style={{ marginBottom: "20px" }}>
                      {" "}
                      Link :{" "}
                      <a href={itemData.link} target="_blank" rel="noreferrer">
                        {itemData.link}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ flex: 0.2 }}></div>
            </div>
          </div>
        ))}
        {loading && (
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              border: "1px solid #555555",
              borderRadius: "10px",
            }}
          >
            <div>
              <h3>loading</h3>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="typing-box">
        <form onSubmit={handleSubmit}>
          {/* <label>
            Enter command:{" "} */}

          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            required
            style={{
              marginTop: "20px",
              width: "90%",
              boxSizing: "border-box",
              marginRight: "10px",
              height: "80px",
              padding: "4px",
              borderRadius: "10px",
            }}
          />

          {/* </label> */}
          <button style={{ height: "40px", width: "100px" }} type="submit">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
