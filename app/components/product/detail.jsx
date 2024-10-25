import {
  Page,
  LegacyCard,
  TextField,
  Grid,
  Thumbnail,
  Text,
  LegacyStack,
  DropZone,
  Select
} from '@shopify/polaris';
import {NoteIcon} from '@shopify/polaris-icons';
import React, {useState, useCallback, useEffect} from 'react';
import '../css/style.css';

export default function Detail() {
  // State quản lý sản phẩm và các thông tin khác
  const [selected, setSelected] = useState('');
  const [productId, setProductId] = useState('');
  const [productData, setProductData] = useState({});
  const [files, setFiles] = useState([]);
  const [value, setValue] = useState('');

  // Lấy ID sản phẩm từ URL
  useEffect(() => {
    const urlParts = window.location.href.split('/');
    const id = urlParts[urlParts.length - 1]; // Lấy phần cuối cùng của URL
    setProductId(id); // Lưu ID vào trạng thái
    fetchProductDetails(id); // Gọi API để lấy chi tiết sản phẩm
  }, []);

  // Hàm gọi API để lấy chi tiết sản phẩm
  const fetchProductDetails = async (id) => {
    const response = await fetch(`/api/products/${id}`, {method: 'GET'});
    const data = await response.json();
    setProductData(data.product); // Lưu dữ liệu sản phẩm vào trạng thái
    setValue(data.product.title); // Cập nhật tiêu đề sản phẩm vào form
    console.error('Error fetching product details:', error);
  };

  const handleSelectChange = useCallback(
    (value) => setSelected(value),
    [],
  );

  const options = [
    {label: 'Today', value: 'today'},
    {label: 'Yesterday', value: 'yesterday'},
    {label: 'Last 7 days', value: 'lastWeek'},
  ];

  const handleDropZoneDrop = useCallback(
    (_dropFiles, acceptedFiles, _rejectedFiles) =>
      setFiles((files) => [...files, ...acceptedFiles]),
    [],
  );

  const validImageTypes = ['image/gif', 'image/jpeg', 'image/png'];

  const fileUpload = !files.length && (
    <DropZone.FileUpload actionHint="Accepts .gif, .jpg, and .png"/>
  );

  const uploadedFiles = files.length > 0 && (
    <LegacyStack vertical>
      {files.map((file, index) => (
        <LegacyStack alignment="center" key={index}>
          <Thumbnail
            size="small"
            alt={file.name}
            source={
              validImageTypes.includes(file.type)
                ? window.URL.createObjectURL(file)
                : NoteIcon
            }
          />
          <div>
            {file.name}{' '}
            <Text variant="bodySm" as="p">
              {file.size} bytes
            </Text>
          </div>
        </LegacyStack>
      ))}
    </LegacyStack>
  );

  const handleChange = useCallback(
    (newValue) => setValue(newValue),
    [],
  );

  return (
    <>
      <Page
        backAction={{content: 'Product Detail', url: '/app/product'}}
        title="Product Detail"
        compactTitle
        primaryAction={{content: 'Save'}}
        secondaryActions={[
          {
            content: 'Duplicate',
            accessibilityLabel: 'Secondary action label',
            onAction: () => alert('Duplicate action'),
          },
          {
            content: 'View on your store',
            onAction: () => alert('View on your store action'),
          },
        ]}
      >
        <Grid>
          <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 8, xl: 8}}>
            <LegacyCard sectioned>
              <TextField
                label="Title"
                value={value}
                onChange={handleChange}
                autoComplete="off"
                placeholder='Name product'
              />
              <br/>
              <DropZone onDrop={handleDropZoneDrop} variableHeight label='Media'>
                {uploadedFiles}
                {fileUpload}
              </DropZone>
              <br/>
              <Select
                label="Category"
                options={options}
                onChange={handleSelectChange}
                value={selected}
              />
              <br/>
              {/* In ra ID sản phẩm */}
              <Text variant="bodyLg" as="p">
               
              </Text>
            </LegacyCard>
          </Grid.Cell>
          <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 4, xl: 4}}>
            <LegacyCard title="Orders" sectioned>
              <p>View a summary of your online store’s orders.</p>
            </LegacyCard>
          </Grid.Cell>
        </Grid>
      </Page>
    </>
  );
}
