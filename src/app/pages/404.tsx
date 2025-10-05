import { NextPage } from "next";

const Custom404: NextPage = () => {
  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h1>404 - หน้านี้ไม่พบ</h1>
      <p>ขออภัย! เราไม่พบหน้าที่คุณกำลังค้นหา</p>
    </div>
  );
};

export default Custom404;
