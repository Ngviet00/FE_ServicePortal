import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button"


export default function HomePage() {
    const { t, i18n } = useTranslation();

    return (
        <div>
            <h1>{t('welcome')}</h1>
            <button onClick={() => i18n.changeLanguage('vi')}>Tiếng Việt</button>
            <button onClick={() => i18n.changeLanguage('en')}>English</button>
            <Button>Click me</Button>

        </div>
    );
}


// export default function UserCreate() {
//     return <div>Create User Page</div>;
//   }
  
//   // UserEdit.tsx
//   export default function UserEdit() {
//     return <div>Edit User Page</div>;
//   }
  
//   // UserList.tsx
//   export default function UserList() {
//     return <div>List of Users</div>;
//   }