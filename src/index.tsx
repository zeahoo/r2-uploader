import { Form, ActionPanel, Action, showToast, LocalStorage, Toast } from "@raycast/api";
import { useEffect, useState } from "react";
import { R2Config } from "./types/Config";
export default function Command() {
  const [accountId, setAccountId] = useState<string>("");
  const [accessKeyId, setAccessKeyId] = useState<string>("");
  const [secretAccessKey, setSecretAccessKey] = useState<string>("");
  const [bucketName, setBucketName] = useState<string>("");
  const [domain, setDomain] = useState<string>("");
  useEffect(() => {
    async function fetchConfig() {
      const value = await LocalStorage.getItem<string>("r2-config");
      if (value) {
        console.log(`loaded from storage ${value}`);
        const config: R2Config = JSON.parse(value);
        setAccountId(config.accountId || "");
        setAccessKeyId(config.accessKeyId || "");
        setSecretAccessKey(config.secretAccessKey || "");
        setBucketName(config.bucketName || "");
        setDomain(config.publicDomain || "");
      }
    }
    fetchConfig();
  }, []);
  async function handleSubmit(values: R2Config) {
    const json = JSON.stringify(values);
    console.log(`save to storage ${json}`);
    await LocalStorage.setItem("r2-config", json);
    showToast({
      style: Toast.Style.Success,
      title: "R2 Config",
      message: "Config saved",
    });
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Save Config" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.Description text="Cloudflare R2 Configuration" />
      <Form.TextField id="accountId" title="ACCOUNT ID" placeholder="" value={accountId} />
      <Form.Separator />
      <Form.TextField id="accessKeyId" title="Access Key ID" placeholder="" value={accessKeyId} />
      <Form.TextField id="secretAccessKey" title="Secret Access Key" placeholder="" value={secretAccessKey} />
      <Form.Separator />
      <Form.TextField id="bucketName" title="Bucket name" placeholder="" value={bucketName} />
      <Form.TextField id="publicDomain" title="Public domain" placeholder="" value={domain} />
      <Form.Separator />
    </Form>
  );
}
